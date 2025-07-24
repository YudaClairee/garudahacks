package adapter

import (
	"errors"
	"github.com/YudaClairee/garudahacks/model"
	"github.com/jmoiron/sqlx"
)

func GetPOSAdapter(provider string, apiKey string, db *sqlx.DB) (model.POSAdapter, error) {
	switch provider {
	case "mock":
		return NewMockPosAdapter(apiKey), nil
	case "db":
		return NewDBPosAdapter(db), nil
	default:
		return nil, errors.New("unsupported POS provider")
	}
}