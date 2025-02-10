
1. 可以視情況最後再試情況是不是要在mask表格上添加
    ```sql
    ALTER TABLE Masks
    ADD FULLTEXT KEY ft_mask_name (name);
    ```
    並且修改查詢方式從like改為match
    ```sql
    SELECT * FROM Masks WHERE MATCH(name) AGAINST('rrr');
    ```
2. 如果需要重新初始化，可以刪除 volume：
    ```bash
    docker-compose down -v
    ```

3. db初始化原理：
    Docker 官方的 MySQL 鏡像有一個特殊的目錄：/docker-entrypoint-initdb.d，容器首次啟動時，會按字母順序執行該目錄下的所有 .sh、.sql 和 .sql.gz 文件

4. 初始化腳本：
   ```
    chmod +x start.sh
    chmod +x mysql/init/*.sh
    ./start.sh
    ```
   