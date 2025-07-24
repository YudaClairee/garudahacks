package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/YudaClairee/garudahacks/model"
	"github.com/gin-gonic/gin"
)

type RevenueHandler struct {
	posAdapter model.POSAdapter
}

type RevenueResponse struct {
	TotalRevenue    float64            `json:"total_revenue"`
	MonthlyRevenues map[string]float64 `json:"monthly_revenues"`
	Orders          []model.Order      `json:"orders,omitempty"`
}

func NewRevenueHandler(posAdapter model.POSAdapter) *RevenueHandler {
	return &RevenueHandler{posAdapter: posAdapter}
}

func (h *RevenueHandler) GetTotalRevenue(c *gin.Context) {
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

	// Calculate total revenue and monthly breakdown
	totalRevenue := 0.0
	monthlyRevenues := make(map[string]float64)

	for _, order := range orders {
		totalRevenue += order.Total

		// Group by month-year
		monthKey := order.CompletedAt.Format("2006-01")
		monthlyRevenues[monthKey] += order.Total
	}

	// Check if client wants detailed orders
	includeOrders := c.DefaultQuery("include_orders", "false") == "true"

	response := RevenueResponse{
		TotalRevenue:    totalRevenue,
		MonthlyRevenues: monthlyRevenues,
	}

	if includeOrders {
		response.Orders = orders
	}

	c.JSON(http.StatusOK, response)
}
