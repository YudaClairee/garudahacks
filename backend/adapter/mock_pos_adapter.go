package adapter

import (
	"time"
	"github.com/YudaClairee/garudahacks/model"
)

type MockPosAdapter struct {
	APIKey string
}

func NewMockPosAdapter(apiKey string) *MockPosAdapter {
	return &MockPosAdapter{APIKey: apiKey}
}

func (s *MockPosAdapter) GetInventory() ([]model.Item, error) {
	// Hit Square API (this is pseudo-code)
	// res := callSquareInventoryAPI(s.APIKey)
	// For now, mock it:
	return []model.Item{
		{ID: "1", Name: "Coke", Stock: 20, Price: 1.5},
		{ID: "2", Name: "Pepsi", Stock: 10, Price: 1.4},
	}, nil
}

func (s *MockPosAdapter) GetCompletedOrders(since time.Time) ([]model.Order, error) {
	// res := callSquareOrdersAPI(since)
	return []model.Order{
		{
			ID: "ord-123",
			Items: []model.OrderItem{
				{ItemID: "1", Quantity: 2},
			},
			Total:       3.0,
			CompletedAt: time.Now(),
		},
	}, nil
}