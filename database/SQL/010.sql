#последних 5 сообщений в истории чата (по времени);

SELECT Messages.text, Messages.date FROM chat.Messages ORDER BY (Messages.date) DESC LIMIT 5
