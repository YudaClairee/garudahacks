package model

import "time"

type Item struct {
	ID    string
	Name  string
	Stock int
	Price float64
	ProductionPrice float64
}

type Order struct {
	ID         string
	Items      []OrderItem
	Total      float64
	CompletedAt time.Time
}

type OrderItem struct {
	ItemID   string
	Quantity int
}

type POSAdapter interface {
	GetInventory() ([]Item, error)
	GetCompletedOrders(since time.Time) ([]Order, error)
}