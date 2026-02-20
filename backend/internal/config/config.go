package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	AppPort          string `mapstructure:"PORT"`
	DBHost           string `mapstructure:"DB_HOST"`
	DBUser           string `mapstructure:"DB_USER"`
	DBPassword       string `mapstructure:"DB_PASSWORD"`
	DBName           string `mapstructure:"DB_NAME"`
	DBPort           string `mapstructure:"DB_PORT"`
	RedisHost        string `mapstructure:"REDIS_HOST"`
	RedisPort        string `mapstructure:"REDIS_PORT"`
	TelegramBotToken string `mapstructure:"TELEGRAM_BOT_TOKEN"`
	TelegramChatID   string `mapstructure:"TELEGRAM_CHAT_ID"`
}

func LoadConfig() (Config, error) {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	// Explicitly bind env vars to match Config struct mapstructure tags
	viper.BindEnv("PORT")
	viper.BindEnv("DB_HOST")
	viper.BindEnv("DB_USER")
	viper.BindEnv("DB_PASSWORD")
	viper.BindEnv("DB_NAME")
	viper.BindEnv("DB_PORT")
	viper.BindEnv("REDIS_HOST")
	viper.BindEnv("REDIS_PORT")
	viper.BindEnv("TELEGRAM_BOT_TOKEN")
	viper.BindEnv("TELEGRAM_CHAT_ID")

	// Default values
	viper.SetDefault("PORT", "8080")
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")

	if err := viper.ReadInConfig(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return config, err
	}

	return config, nil
}
