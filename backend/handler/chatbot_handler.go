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

type ChatbotHandler struct {
	posAdapter model.POSAdapter
}

type ChatRequest struct {
	Message string `json:"message" binding:"required"`
}

type ChatResponse struct {
	Response string `json:"response"`
	Message  string `json:"message"`
}

type GroqChatRequest struct {
	Messages            []GroqChatMessage `json:"messages"`
	Model               string            `json:"model"`
	Temperature         float64           `json:"temperature"`
	MaxCompletionTokens int               `json:"max_completion_tokens"`
	TopP                float64           `json:"top_p"`
	Stream              bool              `json:"stream"`
}

type GroqChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type GroqChatResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func NewChatbotHandler(posAdapter model.POSAdapter) *ChatbotHandler {
	return &ChatbotHandler{posAdapter: posAdapter}
}

func (h *ChatbotHandler) Chat(c *gin.Context) {
	var chatReq ChatRequest
	if err := c.ShouldBindJSON(&chatReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format: " + err.Error()})
		return
	}

	// Gather all business data for system message
	systemMessage, err := h.generateSystemMessage()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to gather business data: " + err.Error()})
		return
	}

	// Get response from Groq
	response, err := h.getChatResponse(systemMessage, chatReq.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get chat response: " + err.Error()})
		return
	}

	chatResponse := ChatResponse{
		Response: response,
		Message:  "Chat response generated successfully",
	}

	c.JSON(http.StatusOK, chatResponse)
}

func (h *ChatbotHandler) generateSystemMessage() (string, error) {
	// Get current year data
	currentYear := time.Now().Year()
	startOfYear := time.Date(currentYear, 1, 1, 0, 0, 0, 0, time.UTC)

	// Get all inventory
	inventory, err := h.posAdapter.GetInventory()
	if err != nil {
		return "", fmt.Errorf("failed to get inventory: %w", err)
	}

	// Get all orders for this year
	orders, err := h.posAdapter.GetCompletedOrders(startOfYear)
	if err != nil {
		return "", fmt.Errorf("failed to get orders: %w", err)
	}

	// Calculate business metrics
	totalRevenue := 0.0
	totalOrders := len(orders)
	totalItemsSold := 0
	totalProductionCost := 0.0
	monthlySales := make(map[string]int)
	monthlyRevenue := make(map[string]float64)
	itemSales := make(map[string]int)

	// Create item lookup map
	itemMap := make(map[string]model.Item)
	for _, item := range inventory {
		itemMap[item.ID] = item
	}

	// Process orders
	for _, order := range orders {
		totalRevenue += order.Total
		monthKey := order.CompletedAt.Format("2006-01")
		monthlyRevenue[monthKey] += order.Total

		for _, orderItem := range order.Items {
			totalItemsSold += orderItem.Quantity
			monthlySales[monthKey] += orderItem.Quantity
			itemSales[orderItem.ItemID] += orderItem.Quantity

			if item, exists := itemMap[orderItem.ItemID]; exists {
				totalProductionCost += float64(orderItem.Quantity) * item.ProductionPrice
			}
		}
	}

	// Calculate profit
	cleanProfit := totalRevenue - totalProductionCost
	profitMargin := 0.0
	if totalRevenue > 0 {
		profitMargin = (cleanProfit / totalRevenue) * 100
	}

	// Get top selling items (top 10)
	type ItemSalesData struct {
		Item      model.Item
		SoldCount int
	}

	var topItems []ItemSalesData
	for itemID, soldCount := range itemSales {
		if item, exists := itemMap[itemID]; exists {
			topItems = append(topItems, ItemSalesData{
				Item:      item,
				SoldCount: soldCount,
			})
		}
	}

	// Sort top items by sales count (simple bubble sort)
	for i := 0; i < len(topItems)-1; i++ {
		for j := 0; j < len(topItems)-i-1; j++ {
			if topItems[j].SoldCount < topItems[j+1].SoldCount {
				topItems[j], topItems[j+1] = topItems[j+1], topItems[j]
			}
		}
	}

	// Limit to top 10
	if len(topItems) > 10 {
		topItems = topItems[:10]
	}

	// Build system message
	systemMessage := fmt.Sprintf(`You are an AI assistant for a Point of Sale (POS) business analytics system. You have access to complete business data and should help users understand their business performance, trends, and provide insights.

CURRENT BUSINESS DATA (%d):

FINANCIAL OVERVIEW:
- Total Revenue YTD: $%.2f
- Total Production Cost: $%.2f
- Clean Profit: $%.2f
- Profit Margin: %.2f%%
- Total Orders: %d
- Total Items Sold: %d

INVENTORY (%d items):`, currentYear, totalRevenue, totalProductionCost, cleanProfit, profitMargin, totalOrders, totalItemsSold, len(inventory))

	// Add inventory details
	for _, item := range inventory {
		systemMessage += fmt.Sprintf(`
- %s (ID: %s): Stock: %d, Price: $%.2f, Production Cost: $%.2f`,
			item.Name, item.ID, item.Stock, item.Price, item.ProductionPrice)
	}

	// Add top selling items
	systemMessage += "\n\nTOP SELLING ITEMS:"
	for i, itemData := range topItems {
		revenue := float64(itemData.SoldCount) * itemData.Item.Price
		systemMessage += fmt.Sprintf(`
%d. %s: %d units sold (Revenue: $%.2f)`,
			i+1, itemData.Item.Name, itemData.SoldCount, revenue)
	}

	// Add monthly sales breakdown
	systemMessage += "\n\nMONTHLY SALES BREAKDOWN:"
	for month := 1; month <= 12; month++ {
		monthKey := fmt.Sprintf("%d-%02d", currentYear, month)
		sales := monthlySales[monthKey]
		revenue := monthlyRevenue[monthKey]
		monthName := time.Month(month).String()
		systemMessage += fmt.Sprintf(`
%s %d: %d items sold, $%.2f revenue`, monthName, currentYear, sales, revenue)
	}

	systemMessage += `

INSTRUCTIONS:
- Answer questions about business performance, trends, and analytics
- Provide insights and recommendations based on the data
- Help with inventory management suggestions
- Analyze sales patterns and seasonal trends
- Compare different items' performance
- Suggest business improvements
- Calculate metrics and projections when asked
- Be conversational and helpful
- If asked about data not provided, clearly state that you don't have that specific information

Always base your responses on the actual data provided above. Be specific with numbers and provide actionable insights.`

	return systemMessage, nil
}

func (h *ChatbotHandler) getChatResponse(systemMessage, userMessage string) (string, error) {
	groqAPIKey := os.Getenv("GROQ_API_KEY")
	if groqAPIKey == "" {
		return "", fmt.Errorf("GROQ_API_KEY environment variable is not set")
	}

	reqBody := GroqChatRequest{
		Messages: []GroqChatMessage{
			{
				Role:    "system",
				Content: systemMessage,
			},
			{
				Role:    "user",
				Content: userMessage,
			},
		},
		Model:               "llama-3.3-70b-versatile", // Good for business conversations
		Temperature:         0.7,
		MaxCompletionTokens: 2048,
		TopP:                0.95,
		Stream:              false,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+groqAPIKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var groqResp GroqChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if len(groqResp.Choices) == 0 {
		return "", fmt.Errorf("no response choices received")
	}

	return groqResp.Choices[0].Message.Content, nil
}
