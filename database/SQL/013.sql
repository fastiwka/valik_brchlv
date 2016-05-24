#имен пользователей, написавших более 3 сообщений сегодня;

SELECT Users.name FROM Users WHERE Users.id IN (SELECT Messages.user_id FROM Messages WHERE Messages.date=CURDATE() GROUP BY Messages.user_id HAVING COUNT(*) > 3)
