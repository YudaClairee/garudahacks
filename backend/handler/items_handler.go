package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/YudaClairee/garudahacks/model"
	"github.com/gin-gonic/gin"
)

type ItemSalesHandler struct {
	posAdapter model.POSAdapter
}

type ItemSales struct {
	ItemID       string  `json:"item_id"`
	ItemName     string  `json:"item_name"`
	Price        float64 `json:"price"`
	TotalSold    int     `json:"total_sold"`
	TotalRevenue float64 `json:"total_revenue"`
}

type ItemSalesResponse struct {
	Period     string      `json:"period"`
	Items      []ItemSales `json:"items"`
	TotalItems int         `json:"total_items"`
	TotalSold  int         `json:"total_sold"`
}

func NewItemSalesHandler(posAdapter model.POSAdapter) *ItemSalesHandler {
	return &ItemSalesHandler{posAdapter: posAdapter}
}

func (h *ItemSalesHandler) GetItemSales(c *gin.Context) {
	// Get time period parameters
	month := c.Query("month")                         // Format: "2025-07" or "07"
	year := c.Query("year")                           // Format: "2025"
	sortBy := c.DefaultQuery("sort_by", "total_sold") // "total_sold", "total_revenue", "item_name"
	order := c.DefaultQuery("order", "desc")          // "asc" or "desc"

	var startTime, endTime time.Time
	var period string

	now := time.Now()

	if year != "" && month != "" {
		// Specific month and year
		yearInt, err := strconv.Atoi(year)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year format"})
			return
		}

		var monthInt int
		if len(month) == 2 {
			monthInt, err = strconv.Atoi(month)
		} else if len(month) == 7 { // "2025-07" format
			monthInt, err = strconv.Atoi(month[5:])
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month format (use MM or YYYY-MM)"})
			return
		}

		if err != nil || monthInt < 1 || monthInt > 12 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month (1-12)"})
			return
		}

		startTime = time.Date(yearInt, time.Month(monthInt), 1, 0, 0, 0, 0, time.UTC)
		endTime = startTime.AddDate(0, 1, 0).Add(-time.Second)
		period = startTime.Format("2006-01")

	} else if year != "" {
		// Entire year
		yearInt, err := strconv.Atoi(year)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year format"})
			return
		}

		startTime = time.Date(yearInt, 1, 1, 0, 0, 0, 0, time.UTC)
		endTime = startTime.AddDate(1, 0, 0).Add(-time.Second)
		period = year

	} else if month != "" {
		// Current year, specific month
		var monthInt int
		var err error

		if len(month) == 2 {
			monthInt, err = strconv.Atoi(month)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month format (use MM)"})
			return
		}

		if err != nil || monthInt < 1 || monthInt > 12 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month (1-12)"})
			return
		}

		startTime = time.Date(now.Year(), time.Month(monthInt), 1, 0, 0, 0, 0, time.UTC)
		endTime = startTime.AddDate(0, 1, 0).Add(-time.Second)
		period = startTime.Format("2006-01")

	} else {
		// Default: current month
		startTime = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
		endTime = startTime.AddDate(0, 1, 0).Add(-time.Second)
		period = startTime.Format("2006-01")
	}

	// Get orders for the specified period
	orders, err := h.posAdapter.GetCompletedOrders(startTime)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	// Filter orders within the end time and get inventory
	inventory, err := h.posAdapter.GetInventory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory"})
		return
	}

	// Create item lookup map
	itemMap := make(map[string]model.Item)
	for _, item := range inventory {
		itemMap[item.ID] = item
	}

	// Calculate sales data
	salesMap := make(map[string]*ItemSales)
	totalSoldOverall := 0

	for _, order := range orders {
		// Skip orders outside our time range
		if order.CompletedAt.After(endTime) {
			continue
		}

		for _, orderItem := range order.Items {
			if item, exists := itemMap[orderItem.ItemID]; exists {
				if sales, exists := salesMap[orderItem.ItemID]; exists {
					sales.TotalSold += orderItem.Quantity
					sales.TotalRevenue += float64(orderItem.Quantity) * item.Price
				} else {
					salesMap[orderItem.ItemID] = &ItemSales{
						ItemID:       orderItem.ItemID,
						ItemName:     item.Name,
						Price:        item.Price,
						TotalSold:    orderItem.Quantity,
						TotalRevenue: float64(orderItem.Quantity) * item.Price,
					}
				}
				totalSoldOverall += orderItem.Quantity
			}
		}
	}

	// Convert map to slice
	var itemSales []ItemSales
	for _, sales := range salesMap {
		itemSales = append(itemSales, *sales)
	}

	// Sort the results
	h.sortItemSales(itemSales, sortBy, order)

	response := ItemSalesResponse{
		Period:     period,
		Items:      itemSales,
		TotalItems: len(itemSales),
		TotalSold:  totalSoldOverall,
	}

	c.JSON(http.StatusOK, response)
}

func (h *ItemSalesHandler) sortItemSales(items []ItemSales, sortBy, order string) {
	// Simple bubble sort implementation (for small datasets)
	// For larger datasets, consider using sort.Slice()
	n := len(items)
	for i := 0; i < n-1; i++ {
		for j := 0; j < n-i-1; j++ {
			var shouldSwap bool

			switch sortBy {
			case "total_sold":
				if order == "desc" {
					shouldSwap = items[j].TotalSold < items[j+1].TotalSold
				} else {
					shouldSwap = items[j].TotalSold > items[j+1].TotalSold
				}
			case "total_revenue":
				if order == "desc" {
					shouldSwap = items[j].TotalRevenue < items[j+1].TotalRevenue
				} else {
					shouldSwap = items[j].TotalRevenue > items[j+1].TotalRevenue
				}
			case "item_name":
				if order == "desc" {
					shouldSwap = items[j].ItemName < items[j+1].ItemName
				} else {
					shouldSwap = items[j].ItemName > items[j+1].ItemName
				}
			default:
				// Default to total_sold desc
				shouldSwap = items[j].TotalSold < items[j+1].TotalSold
			}

			if shouldSwap {
				items[j], items[j+1] = items[j+1], items[j]
			}
		}
	}
}

func (h *ItemSalesHandler) GetTopSellingItems(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit parameter"})
		return
	}

	monthsBackStr := c.DefaultQuery("months", "1")
	monthsBack, err := strconv.Atoi(monthsBackStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid months parameter"})
		return
	}

	since := time.Now().AddDate(0, -monthsBack, 0)

	// Get orders and inventory
	orders, err := h.posAdapter.GetCompletedOrders(since)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	inventory, err := h.posAdapter.GetInventory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory"})
		return
	}

	// Create item lookup map
	itemMap := make(map[string]model.Item)
	for _, item := range inventory {
		itemMap[item.ID] = item
	}

	// Calculate sales data
	salesMap := make(map[string]*ItemSales)
	for _, order := range orders {
		for _, orderItem := range order.Items {
			if item, exists := itemMap[orderItem.ItemID]; exists {
				if sales, exists := salesMap[orderItem.ItemID]; exists {
					sales.TotalSold += orderItem.Quantity
					sales.TotalRevenue += float64(orderItem.Quantity) * item.Price
				} else {
					salesMap[orderItem.ItemID] = &ItemSales{
						ItemID:       orderItem.ItemID,
						ItemName:     item.Name,
						Price:        item.Price,
						TotalSold:    orderItem.Quantity,
						TotalRevenue: float64(orderItem.Quantity) * item.Price,
					}
				}
			}
		}
	}

	// Convert to slice and sort by total sold (desc)
	var itemSales []ItemSales
	for _, sales := range salesMap {
		itemSales = append(itemSales, *sales)
	}

	h.sortItemSales(itemSales, "total_sold", "desc")

	// Limit results
	if limit < len(itemSales) {
		itemSales = itemSales[:limit]
	}

	c.JSON(http.StatusOK, gin.H{
		"top_selling_items": itemSales,
		"period_months":     monthsBack,
	})
}
