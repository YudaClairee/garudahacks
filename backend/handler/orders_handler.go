package handler

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/YudaClairee/garudahacks/model"
	"github.com/gin-gonic/gin"
)

type OrdersHandler struct {
	posAdapter model.POSAdapter
}

type OrdersResponse struct {
	TotalOrders   int            `json:"total_orders"`
	MonthlyOrders map[string]int `json:"monthly_orders"`
	Orders        []model.Order  `json:"orders,omitempty"`
}

type AllOrdersResponse struct {
	Orders      []model.Order `json:"orders"`
	TotalOrders int           `json:"total_orders"`
	Message     string        `json:"message"`
}

func NewOrdersHandler(posAdapter model.POSAdapter) *OrdersHandler {
	return &OrdersHandler{posAdapter: posAdapter}
}

func (h *OrdersHandler) GetAllOrders(c *gin.Context) {
	// Get query parameters for filtering and sorting
	sortBy := c.DefaultQuery("sort_by", "completed_at") // "completed_at", "total", "id"
	order := c.DefaultQuery("order", "desc")            // "asc" or "desc"
	limit := c.Query("limit")                           // Optional limit
	startDate := c.Query("start_date")                  // Optional start date filter (YYYY-MM-DD)
	endDate := c.Query("end_date")                      // Optional end date filter (YYYY-MM-DD)
	minTotal := c.Query("min_total")                    // Optional minimum total filter
	maxTotal := c.Query("max_total")                    // Optional maximum total filter

	// Set default time range (last 12 months if no dates provided)
	var since time.Time
	if startDate != "" {
		var err error
		since, err = time.Parse("2006-01-02", startDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_date format (YYYY-MM-DD)"})
			return
		}
	} else {
		since = time.Now().AddDate(-1, 0, 0) // Default to 1 year ago
	}

	// Get completed orders
	orders, err := h.posAdapter.GetCompletedOrders(since)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	// Apply filters
	var filteredOrders []model.Order
	var endTime time.Time

	if endDate != "" {
		endTime, err = time.Parse("2006-01-02", endDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_date format (YYYY-MM-DD)"})
			return
		}
		endTime = endTime.Add(24*time.Hour - time.Second) // End of day
	}

	for _, order := range orders {
		// Apply end date filter
		if endDate != "" && order.CompletedAt.After(endTime) {
			continue
		}

		// Apply minimum total filter
		if minTotal != "" {
			minTotalFloat, err := strconv.ParseFloat(minTotal, 64)
			if err == nil && order.Total < minTotalFloat {
				continue
			}
		}

		// Apply maximum total filter
		if maxTotal != "" {
			maxTotalFloat, err := strconv.ParseFloat(maxTotal, 64)
			if err == nil && order.Total > maxTotalFloat {
				continue
			}
		}

		filteredOrders = append(filteredOrders, order)
	}

	// Sort the orders
	h.sortOrders(filteredOrders, sortBy, order)

	// Apply limit if specified
	if limit != "" {
		limitInt, err := strconv.Atoi(limit)
		if err == nil && limitInt > 0 && limitInt < len(filteredOrders) {
			filteredOrders = filteredOrders[:limitInt]
		}
	}

	// Prepare response
	response := AllOrdersResponse{
		Orders:      filteredOrders,
		TotalOrders: len(filteredOrders),
		Message:     "Orders retrieved successfully",
	}

	c.JSON(http.StatusOK, response)
}

func (h *OrdersHandler) sortOrders(orders []model.Order, sortBy, order string) {
	n := len(orders)
	for i := 0; i < n-1; i++ {
		for j := 0; j < n-i-1; j++ {
			var shouldSwap bool

			switch sortBy {
			case "completed_at":
				if order == "desc" {
					shouldSwap = orders[j].CompletedAt.Before(orders[j+1].CompletedAt)
				} else {
					shouldSwap = orders[j].CompletedAt.After(orders[j+1].CompletedAt)
				}
			case "total":
				if order == "desc" {
					shouldSwap = orders[j].Total < orders[j+1].Total
				} else {
					shouldSwap = orders[j].Total > orders[j+1].Total
				}
			case "id":
				if order == "desc" {
					shouldSwap = strings.Compare(orders[j].ID, orders[j+1].ID) < 0
				} else {
					shouldSwap = strings.Compare(orders[j].ID, orders[j+1].ID) > 0
				}
			default:
				// Default to completed_at descending (newest first)
				shouldSwap = orders[j].CompletedAt.Before(orders[j+1].CompletedAt)
			}

			if shouldSwap {
				orders[j], orders[j+1] = orders[j+1], orders[j]
			}
		}
	}
}

func (h *OrdersHandler) GetTotalOrders(c *gin.Context) {
	// Get query parameter for months back (default 12 months)
	monthsBackStr := c.DefaultQuery("months", "12")
	monthsBack, err := strconv.Atoi(monthsBackStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid months parameter"})
		return
	}

	// Calculate since date
	since := time.Now().AddDate(0, -monthsBack, 0)

	// Get completed orders
	orders, err := h.posAdapter.GetCompletedOrders(since)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	// Calculate total orders and monthly breakdown
	totalOrders := len(orders)
	monthlyOrders := make(map[string]int)

	for _, order := range orders {
		// Group by month-year
		monthKey := order.CompletedAt.Format("2006-01")
		monthlyOrders[monthKey]++
	}

	// Check if client wants detailed orders
	includeOrders := c.DefaultQuery("include_orders", "false") == "true"

	response := OrdersResponse{
		TotalOrders:   totalOrders,
		MonthlyOrders: monthlyOrders,
	}

	if includeOrders {
		response.Orders = orders
	}

	c.JSON(http.StatusOK, response)
}

func (h *OrdersHandler) GetOrdersByDateRange(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if startDate == "" || endDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start_date and end_date are required"})
		return
	}

	start, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_date format (YYYY-MM-DD)"})
		return
	}

	end, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_date format (YYYY-MM-DD)"})
		return
	}

	// Get orders in date range
	orders, err := h.posAdapter.GetCompletedOrders(start)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	// Filter orders within the end date
	var filteredOrders []model.Order
	dailyOrders := make(map[string]int)

	for _, order := range orders {
		if order.CompletedAt.Before(end.Add(24 * time.Hour)) {
			filteredOrders = append(filteredOrders, order)

			// Group by date
			dateKey := order.CompletedAt.Format("2006-01-02")
			dailyOrders[dateKey]++
		}
	}

	response := map[string]interface{}{
		"total_orders": len(filteredOrders),
		"daily_orders": dailyOrders,
		"orders":       filteredOrders,
	}

	c.JSON(http.StatusOK, response)
}

func (h *OrdersHandler) GetOrdersStats(c *gin.Context) {
	monthsBackStr := c.DefaultQuery("months", "1")
	monthsBack, err := strconv.Atoi(monthsBackStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid months parameter"})
		return
	}

	since := time.Now().AddDate(0, -monthsBack, 0)

	// Get completed orders
	orders, err := h.posAdapter.GetCompletedOrders(since)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	if len(orders) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"total_orders":        0,
			"average_order_value": 0,
			"total_items_sold":    0,
		})
		return
	}

	// Calculate statistics
	totalOrders := len(orders)
	totalRevenue := 0.0
	totalItemsSold := 0

	for _, order := range orders {
		totalRevenue += order.Total
		for _, item := range order.Items {
			totalItemsSold += item.Quantity
		}
	}

	averageOrderValue := totalRevenue / float64(totalOrders)

	response := map[string]interface{}{
		"total_orders":        totalOrders,
		"total_revenue":       totalRevenue,
		"average_order_value": averageOrderValue,
		"total_items_sold":    totalItemsSold,
		"period_start":        since,
		"period_end":          time.Now(),
	}

	c.JSON(http.StatusOK, response)
}