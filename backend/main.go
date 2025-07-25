package main

import (
	"log"
	"net/http"
	"os"

	"github.com/YudaClairee/garudahacks/adapter"
	"github.com/YudaClairee/garudahacks/handler"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Database configuration
	connectionString := os.Getenv("POSTGRES_DSN")

	// Connect to database using sqlx
	db, err := sqlx.Connect("postgres", connectionString)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Configure connection pool for Neon
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Println("Database connection established")

	// Create Gin router
	r := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:8080", "https://nabungai.uk"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	config.AllowCredentials = true

	// Use CORS middleware
	r.Use(cors.New(config))

	// Initialize adapters and handlers with sqlx DB
	posAdapter := adapter.NewDBPosAdapter(db)
	revenueHandler := handler.NewRevenueHandler(posAdapter)
	ordersHandler := handler.NewOrdersHandler(posAdapter)
	itemSalesHandler := handler.NewItemSalesHandler(posAdapter)
	dashboardAIAnalytics := handler.NewDashboardAIHandler(posAdapter)
	addItemHandler := handler.NewAddItemHandler(posAdapter)
	chatbotHandler := handler.NewChatbotHandler(posAdapter)
	insightAIHandler := handler.NewInsightAIHandler(posAdapter)
	addOrderHandler := handler.NewAddOrderHandler(posAdapter)

	// Routes
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "POS Revenue API with PostgreSQL (sqlx)",
		})
	})

	// API routes
	api := r.Group("/api/v1")
	{
		api.GET("/revenue", revenueHandler.GetTotalRevenue)
		api.GET("/orders", ordersHandler.GetTotalOrders)
		api.GET("/orders/get-all", ordersHandler.GetAllOrders)
		api.GET("/items/sales", itemSalesHandler.GetItemSales)
		api.GET("/items/top-selling", itemSalesHandler.GetTopSellingItems)
		api.GET("/items/get-all", itemSalesHandler.GetAllItems)
		api.GET("/dashboard/ai-analysis", dashboardAIAnalytics.GetDashboardAIAnalysis)
		api.GET("/insights/ai-analysis", insightAIHandler.GetBusinessInsights) // New route

		// Add Item routes
		api.POST("/items/upload-csv", addItemHandler.AddItemsFromCSV)
		api.POST("/items/add-single-item", addItemHandler.AddSingleItem)
		api.GET("/items/csv-template", addItemHandler.GetCSVTemplate)

		api.POST("/orders/upload-csv", addOrderHandler.AddOrdersFromCSV)
		api.POST("/orders/add-single-item", addOrderHandler.AddSingleOrder)
		api.GET("/orders/csv-template", addOrderHandler.GetCSVTemplate)

		api.POST("/chat", chatbotHandler.Chat)
	}

	// Start server on port 8080
	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
