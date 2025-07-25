package adapter

import (
	"fmt"
	"log"
	"time"

	"github.com/YudaClairee/garudahacks/model"
	"github.com/jmoiron/sqlx"
)

type DBPosAdapter struct {
	db *sqlx.DB
}

func NewDBPosAdapter(db *sqlx.DB) *DBPosAdapter {
	return &DBPosAdapter{
		db: db,
	}
}

func (d *DBPosAdapter) AddOrder(order model.Order) error {
	// Start a transaction
	tx, err := d.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Insert order
	orderQuery := `
        INSERT INTO orders (id, total, completed_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET
            total = EXCLUDED.total,
            completed_at = EXCLUDED.completed_at`

	_, err = tx.Exec(orderQuery, order.ID, order.Total, order.CompletedAt)
	if err != nil {
		log.Printf("Failed to insert order %s: %v", order.ID, err)
		return fmt.Errorf("failed to insert order %s: %w", order.ID, err)
	}

	// Delete existing order items (in case of update)
	deleteItemsQuery := `DELETE FROM order_items WHERE order_id = $1`
	_, err = tx.Exec(deleteItemsQuery, order.ID)
	if err != nil {
		log.Printf("Failed to delete existing order items for order %s: %v", order.ID, err)
		return fmt.Errorf("failed to delete existing order items for order %s: %w", order.ID, err)
	}

	// Insert order items
	itemQuery := `INSERT INTO order_items (order_id, item_id, quantity) VALUES ($1, $2, $3)`

	for _, item := range order.Items {
		_, err = tx.Exec(itemQuery, order.ID, item.ItemID, item.Quantity)
		if err != nil {
			log.Printf("Failed to insert order item %s for order %s: %v", item.ItemID, order.ID, err)
			return fmt.Errorf("failed to insert order item %s for order %s: %w", item.ItemID, order.ID, err)
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit order transaction: %w", err)
	}

	log.Printf("Successfully added order: %s with %d items (Total: $%.2f)", order.ID, len(order.Items), order.Total)
	return nil
}

func (d *DBPosAdapter) AddOrders(orders []model.Order) error {
	if len(orders) == 0 {
		return nil
	}

	// Start a transaction for batch insert
	tx, err := d.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Prepare statements
	orderQuery := `
        INSERT INTO orders (id, total, completed_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET
            total = EXCLUDED.total,
            completed_at = EXCLUDED.completed_at`

	deleteItemsQuery := `DELETE FROM order_items WHERE order_id = $1`
	itemQuery := `INSERT INTO order_items (order_id, item_id, quantity) VALUES ($1, $2, $3)`

	orderStmt, err := tx.Prepare(orderQuery)
	if err != nil {
		return fmt.Errorf("failed to prepare order statement: %w", err)
	}
	defer orderStmt.Close()

	deleteStmt, err := tx.Prepare(deleteItemsQuery)
	if err != nil {
		return fmt.Errorf("failed to prepare delete statement: %w", err)
	}
	defer deleteStmt.Close()

	itemStmt, err := tx.Prepare(itemQuery)
	if err != nil {
		return fmt.Errorf("failed to prepare item statement: %w", err)
	}
	defer itemStmt.Close()

	successCount := 0
	var failedOrders []string

	for _, order := range orders {
		// Insert order
		_, err = orderStmt.Exec(order.ID, order.Total, order.CompletedAt)
		if err != nil {
			log.Printf("Failed to insert order %s in batch: %v", order.ID, err)
			failedOrders = append(failedOrders, order.ID)
			continue
		}

		// Delete existing order items
		_, err = deleteStmt.Exec(order.ID)
		if err != nil {
			log.Printf("Failed to delete existing order items for order %s in batch: %v", order.ID, err)
			failedOrders = append(failedOrders, order.ID)
			continue
		}

		// Insert order items
		orderSuccess := true
		for _, item := range order.Items {
			_, err = itemStmt.Exec(order.ID, item.ItemID, item.Quantity)
			if err != nil {
				log.Printf("Failed to insert order item %s for order %s in batch: %v", item.ItemID, order.ID, err)
				orderSuccess = false
				break
			}
		}

		if orderSuccess {
			successCount++
		} else {
			failedOrders = append(failedOrders, order.ID)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit batch order transaction: %w", err)
	}

	log.Printf("Successfully added %d out of %d orders in batch", successCount, len(orders))

	if len(failedOrders) > 0 {
		log.Printf("Failed to add orders: %v", failedOrders)
	}

	return nil
}

// GetOrderByID - Helper method to get a single order by ID
func (d *DBPosAdapter) GetOrderByID(orderID string) (*model.Order, error) {
	query := `
        SELECT o.id as order_id, o.total, o.completed_at,
               oi.item_id, oi.quantity
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1
        ORDER BY oi.item_id`

	type OrderWithItem struct {
		OrderID     string    `db:"order_id"`
		Total       float64   `db:"total"`
		CompletedAt time.Time `db:"completed_at"`
		ItemID      *string   `db:"item_id"`
		Quantity    *int      `db:"quantity"`
	}

	var rows []OrderWithItem
	err := d.db.Select(&rows, query, orderID)
	if err != nil {
		log.Printf("Failed to query order %s: %v", orderID, err)
		return nil, fmt.Errorf("failed to query order %s: %w", orderID, err)
	}

	if len(rows) == 0 {
		return nil, fmt.Errorf("order with ID %s not found", orderID)
	}

	// Build order from rows
	order := &model.Order{
		ID:          rows[0].OrderID,
		Total:       rows[0].Total,
		CompletedAt: rows[0].CompletedAt,
		Items:       []model.OrderItem{},
	}

	for _, row := range rows {
		if row.ItemID != nil && row.Quantity != nil {
			orderItem := model.OrderItem{
				ItemID:   *row.ItemID,
				Quantity: *row.Quantity,
			}
			order.Items = append(order.Items, orderItem)
		}
	}

	return order, nil
}

// CheckOrderExists - Helper method to check if an order exists
func (d *DBPosAdapter) CheckOrderExists(orderID string) (bool, error) {
	query := `SELECT COUNT(*) FROM orders WHERE id = $1`

	var count int
	err := d.db.Get(&count, query, orderID)
	if err != nil {
		return false, fmt.Errorf("failed to check if order exists: %w", err)
	}

	return count > 0, nil
}

// DeleteOrder - Helper method to delete an order and its items
func (d *DBPosAdapter) DeleteOrder(orderID string) error {
	// Start a transaction
	tx, err := d.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Delete order items first
	deleteItemsQuery := `DELETE FROM order_items WHERE order_id = $1`
	_, err = tx.Exec(deleteItemsQuery, orderID)
	if err != nil {
		return fmt.Errorf("failed to delete order items for order %s: %w", orderID, err)
	}

	// Delete order
	deleteOrderQuery := `DELETE FROM orders WHERE id = $1`
	result, err := tx.Exec(deleteOrderQuery, orderID)
	if err != nil {
		return fmt.Errorf("failed to delete order %s: %w", orderID, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("order with ID %s not found", orderID)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit delete transaction: %w", err)
	}

	log.Printf("Successfully deleted order: %s", orderID)
	return nil
}

func (d *DBPosAdapter) GetInventory() ([]model.Item, error) {
	query := `
        SELECT id, name, stock, price, production_price AS productionprice
        FROM items 
        ORDER BY name`

	var items []model.Item
	err := d.db.Select(&items, query)
	if err != nil {
		log.Printf("Failed to query inventory: %v", err)
		return nil, fmt.Errorf("failed to query inventory: %w", err)
	}

	return items, nil
}

func (d *DBPosAdapter) GetCompletedOrders(since time.Time) ([]model.Order, error) {
	query := `
        SELECT o.id as order_id, o.total, o.completed_at,
               oi.item_id, oi.quantity
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.completed_at >= $1
        ORDER BY o.completed_at DESC, o.id, oi.item_id`

	type OrderWithItem struct {
		OrderID     string    `db:"order_id"`
		Total       float64   `db:"total"`
		CompletedAt time.Time `db:"completed_at"`
		ItemID      *string   `db:"item_id"`
		Quantity    *int      `db:"quantity"`
	}

	var rows []OrderWithItem
	err := d.db.Select(&rows, query, since)
	if err != nil {
		log.Printf("Failed to query completed orders: %v", err)
		return nil, fmt.Errorf("failed to query completed orders: %w", err)
	}

	// Convert to Order structs
	orderMap := make(map[string]*model.Order)
	var orderIDs []string

	for _, row := range rows {
		// Create order if it doesn't exist
		if _, exists := orderMap[row.OrderID]; !exists {
			orderMap[row.OrderID] = &model.Order{
				ID:          row.OrderID,
				Total:       row.Total,
				CompletedAt: row.CompletedAt,
				Items:       []model.OrderItem{},
			}
			orderIDs = append(orderIDs, row.OrderID)
		}

		// Add order item if it exists
		if row.ItemID != nil && row.Quantity != nil {
			orderItem := model.OrderItem{
				ItemID:   *row.ItemID,
				Quantity: *row.Quantity,
			}
			orderMap[row.OrderID].Items = append(orderMap[row.OrderID].Items, orderItem)
		}
	}

	// Convert map to slice maintaining order
	var orders []model.Order
	for _, orderID := range orderIDs {
		orders = append(orders, *orderMap[orderID])
	}

	return orders, nil
}

func (d *DBPosAdapter) AddItem(item model.Item) error {
	query := `
        INSERT INTO items (id, name, stock, price, production_price)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            stock = EXCLUDED.stock,
            price = EXCLUDED.price,
            production_price = EXCLUDED.production_price`

	_, err := d.db.Exec(query, item.ID, item.Name, item.Stock, item.Price, item.ProductionPrice)
	if err != nil {
		log.Printf("Failed to add item %s: %v", item.ID, err)
		return fmt.Errorf("failed to add item %s: %w", item.ID, err)
	}

	log.Printf("Successfully added/updated item: %s - %s", item.ID, item.Name)
	return nil
}

func (d *DBPosAdapter) AddItems(items []model.Item) error {
	if len(items) == 0 {
		return nil
	}

	// Start a transaction for batch insert
	tx, err := d.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
        INSERT INTO items (id, name, stock, price, production_price)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            stock = EXCLUDED.stock,
            price = EXCLUDED.price,
            production_price = EXCLUDED.production_price`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	successCount := 0
	for _, item := range items {
		_, err := stmt.Exec(item.ID, item.Name, item.Stock, item.Price, item.ProductionPrice)
		if err != nil {
			log.Printf("Failed to add item %s in batch: %v", item.ID, err)
			// Continue with other items instead of failing entirely
			continue
		}
		successCount++
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("Successfully added/updated %d out of %d items in batch", successCount, len(items))
	return nil
}

func (d *DBPosAdapter) UpdateItem(item model.Item) error {
	query := `
        UPDATE items 
        SET name = $2, stock = $3, price = $4, production_price = $5
        WHERE id = $1`

	result, err := d.db.Exec(query, item.ID, item.Name, item.Stock, item.Price, item.ProductionPrice)
	if err != nil {
		log.Printf("Failed to update item %s: %v", item.ID, err)
		return fmt.Errorf("failed to update item %s: %w", item.ID, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("item with ID %s not found", item.ID)
	}

	log.Printf("Successfully updated item: %s - %s", item.ID, item.Name)
	return nil
}

func (d *DBPosAdapter) DeleteItem(itemID string) error {
	// First check if item exists in any orders
	checkQuery := `
        SELECT COUNT(*) 
        FROM order_items 
        WHERE item_id = $1`

	var orderCount int
	err := d.db.Get(&orderCount, checkQuery, itemID)
	if err != nil {
		return fmt.Errorf("failed to check item usage in orders: %w", err)
	}

	if orderCount > 0 {
		return fmt.Errorf("cannot delete item %s: it is referenced in %d order(s)", itemID, orderCount)
	}

	// Delete the item
	query := `DELETE FROM items WHERE id = $1`

	result, err := d.db.Exec(query, itemID)
	if err != nil {
		log.Printf("Failed to delete item %s: %v", itemID, err)
		return fmt.Errorf("failed to delete item %s: %w", itemID, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("item with ID %s not found", itemID)
	}

	log.Printf("Successfully deleted item: %s", itemID)
	return nil
}

// GetItemByID - Helper method to get a single item by ID
func (d *DBPosAdapter) GetItemByID(itemID string) (*model.Item, error) {
	query := `
        SELECT id, name, stock, price, production_price AS productionprice
        FROM items 
        WHERE id = $1`

	var item model.Item
	err := d.db.Get(&item, query, itemID)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return nil, fmt.Errorf("item with ID %s not found", itemID)
		}
		log.Printf("Failed to query item %s: %v", itemID, err)
		return nil, fmt.Errorf("failed to query item %s: %w", itemID, err)
	}

	return &item, nil
}

// CheckItemExists - Helper method to check if an item exists
func (d *DBPosAdapter) CheckItemExists(itemID string) (bool, error) {
	query := `SELECT COUNT(*) FROM items WHERE id = $1`

	var count int
	err := d.db.Get(&count, query, itemID)
	if err != nil {
		return false, fmt.Errorf("failed to check if item exists: %w", err)
	}

	return count > 0, nil
}
