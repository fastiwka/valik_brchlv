#пользователей, которые имеют более 3 сообщений;

SELECT Users.name FROM Users WHERE Users.id IN (SELECT Messages.user_id FROM Messages GROUP BY Messages.user_id HAVING COUNT(*) >= 3)
