package handler

import (
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/YudaClairee/garudahacks/model"
	"github.com/gin-gonic/gin"
)

type AddOrderHandler struct {
	posAdapter model.POSAdapter
}

type AddOrderResponse struct {
	Message       string         `json:"message"`
	OrdersAdded   int            `json:"orders_added"`
	OrdersSkipped int            `json:"orders_skipped"`
	Errors        []string       `json:"errors,omitempty"`
	AddedOrders   []model.Order  `json:"added_orders,omitempty"`
	SkippedOrders []SkippedOrder `json:"skipped_orders,omitempty"`
}

type SkippedOrder struct {
	Row    int    `json:"row"`
	Reason string `json:"reason"`
	Data   string `json:"data"`
}

type CSVOrderRow struct {
	OrderID     string
	ItemID      string
	Quantity    int
	CompletedAt time.Time
}

func NewAddOrderHandler(posAdapter model.POSAdapter) *AddOrderHandler {
	return &AddOrderHandler{posAdapter: posAdapter}
}

func (h *AddOrderHandler) AddOrdersFromCSV(c *gin.Context) {
	// Get the uploaded file
	file, header, err := c.Request.FormFile("csv_file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No CSV file provided"})
		return
	}
	defer file.Close()

	// Validate file extension
	if !strings.HasSuffix(strings.ToLower(header.Filename), ".csv") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File must be a CSV file"})
		return
	}

	// Parse CSV
	reader := csv.NewReader(file)
	reader.FieldsPerRecord = -1 // Allow variable number of fields

	var csvRows []CSVOrderRow
	var skippedOrders []SkippedOrder
	var errors []string
	rowNumber := 0

	// Read header row
	headers, err := reader.Read()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read CSV headers"})
		return
	}
	rowNumber++

	// Validate headers
	requiredHeaders := []string{"order_id", "item_id", "quantity", "completed_at"}
	headerMap := make(map[string]int)

	for i, header := range headers {
		headerMap[strings.ToLower(strings.TrimSpace(header))] = i
	}

	// Check if all required headers are present
	for _, required := range requiredHeaders {
		if _, exists := headerMap[required]; !exists {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Missing required header: %s. Required headers: %v",
					required, requiredHeaders),
			})
			return
		}
	}

	// Get inventory for validation and price calculation
	inventory, err := h.posAdapter.GetInventory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory"})
		return
	}

	itemMap := make(map[string]model.Item)
	for _, item := range inventory {
		itemMap[item.ID] = item
	}

	// Process data rows
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			errors = append(errors, fmt.Sprintf("Row %d: Error reading CSV: %s", rowNumber+1, err.Error()))
			rowNumber++
			continue
		}
		rowNumber++

		// Skip empty rows
		if len(record) == 0 || (len(record) == 1 && strings.TrimSpace(record[0]) == "") {
			continue
		}

		// Parse order row from record
		csvRow, err := h.parseOrderRowFromRecord(record, headerMap, rowNumber)
		if err != nil {
			skippedOrders = append(skippedOrders, SkippedOrder{
				Row:    rowNumber,
				Reason: err.Error(),
				Data:   strings.Join(record, ","),
			})
			continue
		}

		// Validate item exists
		if _, exists := itemMap[csvRow.ItemID]; !exists {
			skippedOrders = append(skippedOrders, SkippedOrder{
				Row:    rowNumber,
				Reason: fmt.Sprintf("Item ID %s not found in inventory", csvRow.ItemID),
				Data:   strings.Join(record, ","),
			})
			continue
		}

		csvRows = append(csvRows, *csvRow)
	}

	// Group CSV rows by order_id and completed_at
	orderMap := make(map[string]*model.Order)

	for _, csvRow := range csvRows {
		orderKey := fmt.Sprintf("%s_%s", csvRow.OrderID, csvRow.CompletedAt.Format("2006-01-02T15:04:05"))

		if order, exists := orderMap[orderKey]; exists {
			// Add item to existing order
			order.Items = append(order.Items, model.OrderItem{
				ItemID:   csvRow.ItemID,
				Quantity: csvRow.Quantity,
			})
		} else {
			// Create new order
			orderMap[orderKey] = &model.Order{
				ID:          csvRow.OrderID,
				CompletedAt: csvRow.CompletedAt,
				Items: []model.OrderItem{
					{
						ItemID:   csvRow.ItemID,
						Quantity: csvRow.Quantity,
					},
				},
				Total: 0, // Will be calculated below
			}
		}
	}

	// Calculate totals for each order
	var validOrders []model.Order
	for _, order := range orderMap {
		total := 0.0
		for _, orderItem := range order.Items {
			if item, exists := itemMap[orderItem.ItemID]; exists {
				total += float64(orderItem.Quantity) * item.Price
			}
		}
		order.Total = total

		// Validate order
		if err := h.validateOrder(order); err != nil {
			skippedOrders = append(skippedOrders, SkippedOrder{
				Row:    -1,
				Reason: "Order validation error: " + err.Error(),
				Data:   fmt.Sprintf("Order ID: %s", order.ID),
			})
			continue
		}

		validOrders = append(validOrders, *order)
	}

	// Save valid orders to database
	var addedOrders []model.Order
	for _, order := range validOrders {
		if err := h.posAdapter.AddOrder(order); err != nil {
			skippedOrders = append(skippedOrders, SkippedOrder{
				Row:    -1, // Database error, not tied to specific row
				Reason: "Database error: " + err.Error(),
				Data:   fmt.Sprintf("Order ID: %s", order.ID),
			})
		} else {
			addedOrders = append(addedOrders, order)
		}
	}

	// Prepare response
	response := AddOrderResponse{
		Message:       fmt.Sprintf("CSV processing completed. %d orders added, %d orders skipped", len(addedOrders), len(skippedOrders)),
		OrdersAdded:   len(addedOrders),
		OrdersSkipped: len(skippedOrders),
		AddedOrders:   addedOrders,
	}

	if len(errors) > 0 {
		response.Errors = errors
	}

	if len(skippedOrders) > 0 {
		response.SkippedOrders = skippedOrders
	}

	// Set appropriate status code
	if len(addedOrders) == 0 && len(skippedOrders) > 0 {
		c.JSON(http.StatusBadRequest, response)
	} else if len(skippedOrders) > 0 {
		c.JSON(http.StatusPartialContent, response) // 206 - Some orders were processed
	} else {
		c.JSON(http.StatusOK, response)
	}
}

func (h *AddOrderHandler) AddSingleOrder(c *gin.Context) {
	var order model.Order

	if err := c.ShouldBindJSON(&order); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format: " + err.Error()})
		return
	}

	// Get inventory for validation and price calculation
	inventory, err := h.posAdapter.GetInventory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory"})
		return
	}

	itemMap := make(map[string]model.Item)
	for _, item := range inventory {
		itemMap[item.ID] = item
	}

	// Calculate total if not provided
	if order.Total == 0 {
		total := 0.0
		for _, orderItem := range order.Items {
			if item, exists := itemMap[orderItem.ItemID]; exists {
				total += float64(orderItem.Quantity) * item.Price
			} else {
				c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Item ID %s not found in inventory", orderItem.ItemID)})
				return
			}
		}
		order.Total = total
	}

	// Set completion time if not provided
	if order.CompletedAt.IsZero() {
		order.CompletedAt = time.Now()
	}

	// Validate order
	if err := h.validateOrder(&order); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation error: " + err.Error()})
		return
	}

	// Save to database
	if err := h.posAdapter.AddOrder(order); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add order to database: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Order added successfully",
		"order":   order,
	})
}

func (h *AddOrderHandler) parseOrderRowFromRecord(record []string, headerMap map[string]int, rowNumber int) (*CSVOrderRow, error) {
	// Helper function to get field value safely
	getField := func(fieldName string) (string, error) {
		index, exists := headerMap[fieldName]
		if !exists {
			return "", fmt.Errorf("missing header: %s", fieldName)
		}
		if index >= len(record) {
			return "", fmt.Errorf("missing data for field: %s", fieldName)
		}
		return strings.TrimSpace(record[index]), nil
	}

	// Parse Order ID
	orderID, err := getField("order_id")
	if err != nil {
		return nil, err
	}

	// Parse Item ID
	itemID, err := getField("item_id")
	if err != nil {
		return nil, err
	}

	// Parse Quantity
	quantityStr, err := getField("quantity")
	if err != nil {
		return nil, err
	}
	quantity, err := strconv.Atoi(quantityStr)
	if err != nil {
		return nil, fmt.Errorf("invalid quantity value: %s", quantityStr)
	}

	// Parse Completed At
	completedAtStr, err := getField("completed_at")
	if err != nil {
		return nil, err
	}

	// Try multiple date formats
	var completedAt time.Time
	dateFormats := []string{
		"2006-01-02 15:04:05",
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05",
		"2006-01-02",
		"01/02/2006",
		"01/02/2006 15:04:05",
	}

	for _, format := range dateFormats {
		if completedAt, err = time.Parse(format, completedAtStr); err == nil {
			break
		}
	}

	if err != nil {
		return nil, fmt.Errorf("invalid completed_at format: %s (expected formats: YYYY-MM-DD HH:MM:SS, YYYY-MM-DD, MM/DD/YYYY, etc.)", completedAtStr)
	}

	return &CSVOrderRow{
		OrderID:     orderID,
		ItemID:      itemID,
		Quantity:    quantity,
		CompletedAt: completedAt,
	}, nil
}

func (h *AddOrderHandler) validateOrder(order *model.Order) error {
	if order.ID == "" {
		return fmt.Errorf("order ID cannot be empty")
	}
	if len(order.Items) == 0 {
		return fmt.Errorf("order must have at least one item")
	}
	if order.Total < 0 {
		return fmt.Errorf("order total cannot be negative")
	}
	if order.CompletedAt.IsZero() {
		return fmt.Errorf("completed_at cannot be empty")
	}

	for i, item := range order.Items {
		if item.ItemID == "" {
			return fmt.Errorf("item %d: item_id cannot be empty", i+1)
		}
		if item.Quantity <= 0 {
			return fmt.Errorf("item %d: quantity must be positive", i+1)
		}
	}

	return nil
}

func (h *AddOrderHandler) GetCSVTemplate(c *gin.Context) {
	// Return CSV template
	template := "order_id,item_id,quantity,completed_at\n"
	template += "ORD001,ITEM001,2,2025-01-15 10:30:00\n"
	template += "ORD001,ITEM002,1,2025-01-15 10:30:00\n"
	template += "ORD002,ITEM001,3,2025-01-16 14:20:00\n"
	template += "ORD003,ITEM003,1,2025-01-17 09:15:00"

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=orders_template.csv")
	c.String(http.StatusOK, template)
}
