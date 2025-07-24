package model

import "time"

type Item struct {
	ID              string  `json:"id"`
	Name            string  `json:"name"`
	Stock           int     `json:"stock"`
	Price           float64 `json:"price"`
	ProductionPrice float64 `json:"production_price"`
}

type Order struct {
	ID          string      `json:"id"`
	Items       []OrderItem `json:"items"`
	Total       float64     `json:"total"`
	CompletedAt time.Time   `json:"completed_at"`
}

type OrderItem struct {
	ItemID   string `json:"item_id"`
	Quantity int    `json:"quantity"`
}

type POSAdapter interface {
	GetInventory() ([]Item, error)
	GetCompletedOrders(since time.Time) ([]Order, error)
	AddItem(item Item) error
	AddItems(items []Item) error
	UpdateItem(item Item) error
	DeleteItem(itemID string) error
}
