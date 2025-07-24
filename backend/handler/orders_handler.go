package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/YudaClairee/garudahacks/model"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type OrdersHandler struct {
	posAdapter model.POSAdapter
}

type OrdersResponse struct {
	TotalOrders   int            `json:"total_orders"`
	MonthlyOrders map[string]int `json:"monthly_orders"`
	Orders        []model.Order  `json:"orders,omitempty"`
}

func NewOrdersHandler(posAdapter model.POSAdapter) *OrdersHandler {
	return &OrdersHandler{posAdapter: posAdapter}
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

func GetAllOrders(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var orders []model.Order
		err := db.Select(&orders, "SELECT * FROM orders")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
			return
		}
		c.JSON(http.StatusOK, orders)
	}
}