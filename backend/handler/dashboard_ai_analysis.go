package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/YudaClairee/garudahacks/model"
	"github.com/gin-gonic/gin"
)

type DashboardAIHandler struct {
	posAdapter model.POSAdapter
}

type GroqRequest struct {
	Messages            []GroqMessage `json:"messages"`
	Model               string        `json:"model"`
	Temperature         float64       `json:"temperature"`
	MaxCompletionTokens int           `json:"max_completion_tokens"`
	TopP                float64       `json:"top_p"`
	Stream              bool          `json:"stream"`
	ReasoningEffort     string        `json:"reasoning_effort"`
	ResponseFormat      struct {
		Type string `json:"type"`
	} `json:"response_format"`
	Stop interface{} `json:"stop"`
}

type GroqMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type GroqResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

type AIAnalysisResponse struct {
	TopSellersRecommendation string `json:"top_sellers_recommendation"`
	SalesForecastNextMonth   int    `json:"sales_forecast_next_month"`
	RevenueInsights          string `json:"revenue_insights"`
	CrowdAnalysis            struct {
		EstimatedCrowds int    `json:"estimated_crowds"`
		Recommendation  string `json:"recommendation"`
	} `json:"crowd_analysis"`
}

type CashflowAnalysis struct {
	CleanProfit    float64 `json:"clean_profit"`
	ProfitMargin   float64 `json:"profit_margin"`
	CashflowStatus string  `json:"cashflow_status"`
	StatusMessage  string  `json:"status_message"`
}

func NewDashboardAIHandler(posAdapter model.POSAdapter) *DashboardAIHandler {
	return &DashboardAIHandler{posAdapter: posAdapter}
}

func (h *DashboardAIHandler) GetDashboardAIAnalysis(c *gin.Context) {
	// Get business location from query parameter
	location := c.DefaultQuery("location", "Unknown Location")

	// Get current year
	currentYear := time.Now().Year()
	startOfYear := time.Date(currentYear, 1, 1, 0, 0, 0, 0, time.UTC)

	// Get top 5 selling items for the year
	orders, err := h.posAdapter.GetCompletedOrders(startOfYear)
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

	// Calculate sales data and profit
	salesMap := make(map[string]*ItemSales)
	totalSalesYTD := 0
	totalRevenueYTD := 0.0
	totalProductionCost := 0.0

	for _, order := range orders {
		totalRevenueYTD += order.Total
		for _, orderItem := range order.Items {
			totalSalesYTD += orderItem.Quantity
			if item, exists := itemMap[orderItem.ItemID]; exists {
				// Calculate production cost
				itemProductionCost := float64(orderItem.Quantity) * item.ProductionPrice
				totalProductionCost += itemProductionCost

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

	// Calculate clean profit and cashflow status
	cleanProfit := totalRevenueYTD - totalProductionCost
	profitMargin := 0.0
	if totalRevenueYTD > 0 {
		profitMargin = (cleanProfit / totalRevenueYTD) * 100
	}

	cashflowAnalysis := h.calculateCashflowStatus(cleanProfit, profitMargin)

	// Convert to slice and get top 5
	var itemSales []ItemSales
	for _, sales := range salesMap {
		itemSales = append(itemSales, *sales)
	}

	// Sort by total sold (desc)
	h.sortItemSales(itemSales, "total_sold", "desc")

	// Get top 5
	topItems := itemSales
	if len(topItems) > 5 {
		topItems = topItems[:5]
	}

	// Prepare content for AI
	content := h.prepareAIContent(topItems, totalSalesYTD, totalRevenueYTD, location)

	// Get AI analysis
	analysis, err := h.getAIAnalysis(content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get AI analysis: " + err.Error()})
		return
	}

	// Return the response
	response := gin.H{
		"top_selling_items": topItems,
		"total_sales_ytd":   totalSalesYTD,
		"total_revenue_ytd": totalRevenueYTD,
		"business_location": location,
		"year":              currentYear,
		"ai_analysis":       analysis,
		"cashflow_analysis": cashflowAnalysis,
	}

	c.JSON(http.StatusOK, response)
}

func (h *DashboardAIHandler) prepareAIContent(topItems []ItemSales, totalSalesYTD int, totalRevenueYTD float64, location string) string {
	content := fmt.Sprintf("Business Location: %s\n\n", location)
	content += fmt.Sprintf("Total Sales Year-to-Date (YTD): %d items sold\n\n", totalSalesYTD)
	content += fmt.Sprintf("Total Revenue This Year: $%.2f\n\n", totalRevenueYTD)

	content += "Top 5 Best-Selling Items:\n"
	for i, item := range topItems {
		content += fmt.Sprintf("%d. %s - %d units sold (Revenue: $%.2f)\n",
			i+1, item.ItemName, item.TotalSold, item.TotalRevenue)
	}

	return content
}

func (h *DashboardAIHandler) getAIAnalysis(content string) (*AIAnalysisResponse, error) {
	groqAPIKey := os.Getenv("GROQ_API_KEY")
	if groqAPIKey == "" {
		return nil, fmt.Errorf("GROQ_API_KEY environment variable is not set")
	}

	systemPrompt := `You are a business analytics assistant. I will provide you:

    The 5 best-selling items.

    Total sales year-to-date (YTD).

    Total revenue this year.

    Business location.

Your task:

    Generate a short (2–3 lines) recommendation based on the 5 best-selling items.

    Forecast next month's sales using the YTD sales trend.

    Reflect on the total revenue this year, identify low-performing products or categories, and give insights in no more than 3–4 lines.

    Estimate crowd levels (visitor count or volume) based on the location and the previous data, then provide a recommendation related to staffing, stock, or layout.

Respond only with a JSON output in the following format:

{
  "top_sellers_recommendation": "string (2–3 lines)",
  "sales_forecast_next_month": number,
  "revenue_insights": "string (max 3–4 lines)",
  "crowd_analysis": {
    "estimated_crowds": number,
    "recommendation": "string (1–2 lines)"
  }
}

Do not add any explanation or text outside the JSON.`

	reqBody := GroqRequest{
		Messages: []GroqMessage{
			{
				Role:    "system",
				Content: systemPrompt,
			},
			{
				Role:    "user",
				Content: content,
			},
		},
		Model:               "qwen/qwen3-32b",
		Temperature:         0.6,
		MaxCompletionTokens: 4096,
		TopP:                0.95,
		Stream:              false,
		ReasoningEffort:     "default",
		ResponseFormat: struct {
			Type string `json:"type"`
		}{
			Type: "json_object",
		},
		Stop: nil,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %v", err)
	}

	req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+groqAPIKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var groqResp GroqResponse
	if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	if len(groqResp.Choices) == 0 {
		return nil, fmt.Errorf("no choices in response")
	}

	// Parse the AI response JSON
	var analysis AIAnalysisResponse
	if err := json.Unmarshal([]byte(groqResp.Choices[0].Message.Content), &analysis); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %v", err)
	}

	return &analysis, nil
}

func (h *DashboardAIHandler) calculateCashflowStatus(cleanProfit, profitMargin float64) CashflowAnalysis {
	var status, message string

	switch {
	case cleanProfit < 0:
		status = "NEGATIVE"
		message = "Business is operating at a loss. Immediate action required."
	case profitMargin < 5:
		status = "POOR"
		message = "Very low profit margin. Consider reducing costs or increasing prices."
	case profitMargin < 15:
		status = "FAIR"
		message = "Moderate profit margin. Room for improvement in efficiency."
	case profitMargin < 25:
		status = "GOOD"
		message = "Healthy profit margin. Business is performing well."
	case profitMargin < 35:
		status = "EXCELLENT"
		message = "Strong profit margin. Excellent business performance."
	default:
		status = "OUTSTANDING"
		message = "Exceptional profit margin. Outstanding business performance."
	}

	return CashflowAnalysis{
		CleanProfit:    cleanProfit,
		ProfitMargin:   profitMargin,
		CashflowStatus: status,
		StatusMessage:  message,
	}
}

func (h *DashboardAIHandler) sortItemSales(items []ItemSales, sortBy, order string) {
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
				shouldSwap = items[j].TotalSold < items[j+1].TotalSold
			}

			if shouldSwap {
				items[j], items[j+1] = items[j+1], items[j]
			}
		}
	}
}
