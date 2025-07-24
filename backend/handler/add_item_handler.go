package handler

import (
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/YudaClairee/garudahacks/model"
	"github.com/gin-gonic/gin"
)

type AddItemHandler struct {
	posAdapter model.POSAdapter
}

type AddItemResponse struct {
	Message      string        `json:"message"`
	ItemsAdded   int           `json:"items_added"`
	ItemsSkipped int           `json:"items_skipped"`
	Errors       []string      `json:"errors,omitempty"`
	AddedItems   []model.Item  `json:"added_items,omitempty"`
	SkippedItems []SkippedItem `json:"skipped_items,omitempty"`
}

type SkippedItem struct {
	Row    int    `json:"row"`
	Reason string `json:"reason"`
	Data   string `json:"data"`
}

func NewAddItemHandler(posAdapter model.POSAdapter) *AddItemHandler {
	return &AddItemHandler{posAdapter: posAdapter}
}

func (h *AddItemHandler) AddItemsFromCSV(c *gin.Context) {
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

	var addedItems []model.Item
	var skippedItems []SkippedItem
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
	requiredHeaders := []string{"id", "name", "stock", "price", "production_price"}
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

		// Parse item from record
		item, err := h.parseItemFromRecord(record, headerMap, rowNumber)
		if err != nil {
			skippedItems = append(skippedItems, SkippedItem{
				Row:    rowNumber,
				Reason: err.Error(),
				Data:   strings.Join(record, ","),
			})
			continue
		}

		// Validate item
		if err := h.validateItem(item); err != nil {
			skippedItems = append(skippedItems, SkippedItem{
				Row:    rowNumber,
				Reason: "Validation error: " + err.Error(),
				Data:   strings.Join(record, ","),
			})
			continue
		}

		addedItems = append(addedItems, *item)
	}

	// Prepare response
	response := AddItemResponse{
		Message:      fmt.Sprintf("CSV processing completed. %d items added, %d items skipped", len(addedItems), len(skippedItems)),
		ItemsAdded:   len(addedItems),
		ItemsSkipped: len(skippedItems),
		AddedItems:   addedItems,
	}

	if len(errors) > 0 {
		response.Errors = errors
	}

	if len(skippedItems) > 0 {
		response.SkippedItems = skippedItems
	}

	// Set appropriate status code
	if len(addedItems) == 0 && len(skippedItems) > 0 {
		c.JSON(http.StatusBadRequest, response)
	} else if len(skippedItems) > 0 {
		c.JSON(http.StatusPartialContent, response) // 206 - Some items were processed
	} else {
		c.JSON(http.StatusOK, response)
	}
}

func (h *AddItemHandler) parseItemFromRecord(record []string, headerMap map[string]int, rowNumber int) (*model.Item, error) {
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

	// Parse ID
	id, err := getField("id")
	if err != nil {
		return nil, err
	}

	// Parse Name
	name, err := getField("name")
	if err != nil {
		return nil, err
	}

	// Parse Stock
	stockStr, err := getField("stock")
	if err != nil {
		return nil, err
	}
	stock, err := strconv.Atoi(stockStr)
	if err != nil {
		return nil, fmt.Errorf("invalid stock value: %s", stockStr)
	}

	// Parse Price
	priceStr, err := getField("price")
	if err != nil {
		return nil, err
	}
	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid price value: %s", priceStr)
	}

	// Parse Production Price
	productionPriceStr, err := getField("production_price")
	if err != nil {
		return nil, err
	}
	productionPrice, err := strconv.ParseFloat(productionPriceStr, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid production_price value: %s", productionPriceStr)
	}

	return &model.Item{
		ID:              id,
		Name:            name,
		Stock:           stock,
		Price:           price,
		ProductionPrice: productionPrice,
	}, nil
}

func (h *AddItemHandler) validateItem(item *model.Item) error {
	if item.ID == "" {
		return fmt.Errorf("ID cannot be empty")
	}
	if item.Name == "" {
		return fmt.Errorf("name cannot be empty")
	}
	if item.Stock < 0 {
		return fmt.Errorf("stock cannot be negative")
	}
	if item.Price < 0 {
		return fmt.Errorf("price cannot be negative")
	}
	if item.ProductionPrice < 0 {
		return fmt.Errorf("production price cannot be negative")
	}
	if item.ProductionPrice > item.Price {
		return fmt.Errorf("production price ($%.2f) cannot be higher than selling price ($%.2f)",
			item.ProductionPrice, item.Price)
	}
	return nil
}

func (h *AddItemHandler) AddSingleItem(c *gin.Context) {
	var item model.Item

	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format: " + err.Error()})
		return
	}

	// Validate item
	if err := h.validateItem(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation error: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Item added successfully",
		"item":    item,
	})
}

func (h *AddItemHandler) GetCSVTemplate(c *gin.Context) {
	// Return CSV template
	template := "id,name,stock,price,production_price\n"
	template += "ITEM001,Sample Item 1,100,10.99,5.50\n"
	template += "ITEM002,Sample Item 2,50,25.00,12.00\n"
	template += "ITEM003,Sample Item 3,200,7.50,3.75"

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=items_template.csv")
	c.String(http.StatusOK, template)
}
