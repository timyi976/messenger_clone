# Web Programming #HW4

## Run the project

***Modified from Notion Clone***

1. Install dependencies
   ```bash
   yarn
   ```
2. Get Pusher credentials

   Please refer to the [Pusher Setup](https://github.com/ntuee-web-programming/112-1-unit2-notion-clone#pusher-setup) section in Notion Clone README for more details.

3. Create `.env.local` file in the project root and add the following content:

   ```text
   POSTGRES_URL=postgres://postgres:postgres@localhost:5432/messenger

   PUSHER_ID=
   NEXT_PUBLIC_PUSHER_KEY=
   PUSHER_SECRET=
   NEXT_PUBLIC_PUSHER_CLUSTER=

   AUTH_SECRET=<this can be any random string>

   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

   Note that Github auth is not implemented in this project, therefore, those settings about Github login is nor required, and, you do not need to fill in `AUTH_GITHUB` fields.

4. Start the database
   ```bash
   docker compose up -d
   ```
5. Run migrations
   ```bash
   yarn migrate
   ```
6. Start the development server
   ```bash
   yarn dev
   ```
7. Open http://localhost:3000 in your browser

## Features

1. 不管是傳送訊息、刪除訊息、釘選訊息、新增聊天室、刪除聊天室，都會同步到對方的前端介面上，包含訊息頁面及聊天室列表都會同步更新。

2. 在登入後或當前的聊天室被對方刪除時，如果有可用的聊天室，則會自動跳轉到最新的聊天室；使用新增聊天室按鈕新增聊天室或是從搜尋結果提示新增聊天室(見以下 3)時，若成功新增則會自動跳轉到該聊天室。

3. 可以在搜尋列搜尋其他使用者的名字，按下搜尋按鈕或按下 enter 後，即可顯示符合輸入字串的使用者；若是找不到使用者，則在聊天室列表搜尋結果會出現詢問是否增加聊天室的提示，點擊後即可新增聊天室並會自動跳轉到該聊天室。

4. 在聊天室列表的搜尋結果中，如果搜尋欄為空，則一旁的搜尋按鈕會變成取消搜尋，點擊後即可顯示所有聊天室。

   ![](https://imgur.com/vVH5UfT.jpg)

5. 在訊息旁邊有釘選及刪除按鈕可以點擊，釘選按鈕點擊之後即可釘選該訊息；刪除按鈕點擊後會詢問要對自己刪除或對所有人刪除。此外，釘選的訊息無法刪除，必須先取消釘選才能刪除。

6. 若直接在自己傳送的訊息點擊右鍵，則一樣可以顯示刪除的提示選單。

7. 在已送出的訊息中，會自動偵測是否包含連結，如果有的話，則可以直接點擊該連結開啟新視窗。

   ![](https://imgur.com/JddrzXo.jpg)

8. 當訊息數量超過介面可顯示高度且出現新訊息時，聊天紀錄會自動滾動至最下方。

## 進階要求（Perfect）

- **傳送連結**：自動辨識訊息中文字是否為連結。若是連結，則可以透過該連結開啟新視窗。

- **自動滾動**：當訊息數量超過介面可顯示高度且出現新訊息時，聊天紀錄會自動滾動至最下方。