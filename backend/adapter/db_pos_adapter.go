package adapter

import (
	"fmt"
	"log"
	"time"

	"github.com/YudaClairee/garudahacks/model"
	"github.com/jmoiron/sqlx"
)

type DBPosAdapter struct {
	db     *sqlx.DB
}

func NewDBPosAdapter(db *sqlx.DB) *DBPosAdapter {
	return &DBPosAdapter{
		db:     db,
	}
}

func (d *DBPosAdapter) GetInventory() ([]model.Item, error) {
	query := `
        SELECT id, name, stock, price 
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
