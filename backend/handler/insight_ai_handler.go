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

type InsightAIHandler struct {
	posAdapter model.POSAdapter
}

type GroqInsightRequest struct {
	Messages            []GroqInsightMessage `json:"messages"`
	Model               string               `json:"model"`
	Temperature         float64              `json:"temperature"`
	MaxCompletionTokens int                  `json:"max_completion_tokens"`
	TopP                float64              `json:"top_p"`
	Stream              bool                 `json:"stream"`
	ReasoningEffort     string               `json:"reasoning_effort"`
	ResponseFormat      struct {
		Type string `json:"type"`
	} `json:"response_format"`
	Stop interface{} `json:"stop"`
}

type GroqInsightMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type GroqInsightResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

type MonthlyRevenue struct {
	Month   string  `json:"month"`
	Revenue float64 `json:"revenue"`
}

type MonthProjection struct {
	HiPredict  float64 `json:"hi_predict"`
	Stagnancy  float64 `json:"stagnancy"`
	BadPredict float64 `json:"bad_predict"`
}

type RevenueForecast struct {
	LastMonthProjection MonthProjection `json:"last_month_projection"`
	Month1              MonthProjection `json:"month_1"`
	Month2              MonthProjection `json:"month_2"`
}

type InsightAIResponse struct {
	RevenueForecast RevenueForecast `json:"revenue_forecast"`
	FinancialTips   []string        `json:"financial_tips"`
	TrendAnalytics  string          `json:"trend_analytics"`
}

type BusinessInsightResponse struct {
	MonthlyRevenues []MonthlyRevenue  `json:"monthly_revenues"`
	TotalRevenue    float64           `json:"total_revenue"`
	TotalProfit     float64           `json:"total_profit"`
	TotalExpenses   float64           `json:"total_expenses"`
	AIInsights      InsightAIResponse `json:"ai_insights"`
	Year            int               `json:"year"`
	Message         string            `json:"message"`
}

func NewInsightAIHandler(posAdapter model.POSAdapter) *InsightAIHandler {
	return &InsightAIHandler{posAdapter: posAdapter}
}

func (h *InsightAIHandler) GetBusinessInsights(c *gin.Context) {
	// Get current year and month
	now := time.Now()
	currentYear := now.Year()
	currentMonth := int(now.Month())
	startOfYear := time.Date(currentYear, 1, 1, 0, 0, 0, 0, time.UTC)

	// Get all orders for the year
	orders, err := h.posAdapter.GetCompletedOrders(startOfYear)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	// Get inventory for production costs
	inventory, err := h.posAdapter.GetInventory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory"})
		return
	}

	// Create item lookup map for production costs
	itemMap := make(map[string]model.Item)
	for _, item := range inventory {
		itemMap[item.ID] = item
	}

	// Calculate monthly revenues and financial data
	monthlyRevenues := make(map[string]float64)
	totalRevenue := 0.0
	totalProductionCost := 0.0

	for _, order := range orders {
		monthKey := order.CompletedAt.Format("2006-01")
		monthlyRevenues[monthKey] += order.Total
		totalRevenue += order.Total

		// Calculate production costs
		for _, orderItem := range order.Items {
			if item, exists := itemMap[orderItem.ItemID]; exists {
				totalProductionCost += float64(orderItem.Quantity) * item.ProductionPrice
			}
		}
	}

	// Convert to ordered array of monthly revenues (only up to current month)
	var monthlyRevenueArray []MonthlyRevenue
	for month := 1; month <= currentMonth; month++ {
		monthKey := fmt.Sprintf("%d-%02d", currentYear, month)
		revenue := monthlyRevenues[monthKey]
		monthlyRevenueArray = append(monthlyRevenueArray, MonthlyRevenue{
			Month:   fmt.Sprintf("%s %d", time.Month(month).String(), currentYear),
			Revenue: revenue,
		})
	}

	// Calculate financial metrics
	totalProfit := totalRevenue - totalProductionCost
	totalExpenses := totalProductionCost

	// Prepare AI content
	content := h.prepareInsightContent(monthlyRevenueArray, totalRevenue, totalProfit, totalExpenses, currentMonth)

	// Get AI insights
	aiInsights, err := h.getAIInsights(content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get AI insights: " + err.Error()})
		return
	}

	// Prepare response
	response := BusinessInsightResponse{
		MonthlyRevenues: monthlyRevenueArray,
		TotalRevenue:    totalRevenue,
		TotalProfit:     totalProfit,
		TotalExpenses:   totalExpenses,
		AIInsights:      *aiInsights,
		Year:            currentYear,
		Message:         "Business insights generated successfully",
	}

	c.JSON(http.StatusOK, response)
}

func (h *InsightAIHandler) prepareInsightContent(monthlyRevenues []MonthlyRevenue, totalRevenue, totalProfit, totalExpenses float64, currentMonth int) string {
	content := fmt.Sprintf("Monthly Revenue Data (January to %s %d):\n", time.Month(currentMonth).String(), time.Now().Year())
	for _, monthData := range monthlyRevenues {
		content += fmt.Sprintf("%s: $%.2f\n", monthData.Month, monthData.Revenue)
	}

	content += fmt.Sprintf("\nCurrent Financial Numbers (Year-to-Date through %s):\n", time.Month(currentMonth).String())
	content += fmt.Sprintf("Total Revenue: $%.2f\n", totalRevenue)
	content += fmt.Sprintf("Total Profit: $%.2f\n", totalProfit)
	content += fmt.Sprintf("Total Expenses: $%.2f\n", totalExpenses)

	return content
}

func (h *InsightAIHandler) getAIInsights(content string) (*InsightAIResponse, error) {
	groqAPIKey := os.Getenv("GROQ_API_KEY")
	if groqAPIKey == "" {
		return nil, fmt.Errorf("GROQ_API_KEY environment variable is not set")
	}

	systemPrompt := `You are a financial analytics assistant. I will provide:

        An array of monthly revenues (e.g., January to July).

        A set of financial figures: total revenue, total profit, and total expenses.

    Your tasks:

    Predict revenue for the last available month (transition month) using three scenarios:

        hi_predict: optimistic spike

        stagnancy: stable scenario

        bad_predict: conservative drop
        This helps simulate how the month could've gone, based on current trends.

    Predict the next two future months, using the same three-scenario structure (hi_predict, stagnancy, bad_predict for each).

    Based on the provided revenue, profit, and expenses, generate at least three actionable tips to help the business make informed decisions.

    Analyze the revenue trend from the historical array: whether it's increasing, declining, seasonal, or inconsistent. Output a summary in no more than 3 lines.

    Output everything strictly in the following JSON format:

{
  "revenue_forecast": {
    "last_month_projection": {
      "hi_predict": number,
      "stagnancy": number,
      "bad_predict": number
    },
    "month_1": {
      "hi_predict": number,
      "stagnancy": number,
      "bad_predict": number
    },
    "month_2": {
      "hi_predict": number,
      "stagnancy": number,
      "bad_predict": number
    }
  },
  "financial_tips": [
    "string",
    "string",
    "string"
  ],
  "trend_analytics": "string (max 3 lines summary of revenue trend)"
}

    Do not return any text outside the JSON.`

	reqBody := GroqInsightRequest{
		Messages: []GroqInsightMessage{
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

	var groqResp GroqInsightResponse
	if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	if len(groqResp.Choices) == 0 {
		return nil, fmt.Errorf("no choices in response")
	}

	// Parse the AI response JSON
	var insights InsightAIResponse
	if err := json.Unmarshal([]byte(groqResp.Choices[0].Message.Content), &insights); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %v", err)
	}

	return &insights, nil
}
