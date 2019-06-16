# KIRIBAN
Node.jsやCouchDBの練習用に開発した、古の個人サイト風SNS。

「個人サイト」という古めかしいものをベースに「機械学習」やら「WebRTC」やらをくっつけたカオス。

![image](https://user-images.githubusercontent.com/19220989/59559384-fbe66d80-9040-11e9-9453-edec8dd5dc91.png)

## 基本的な機能
登録したユーザがそれぞれ自分のページを作って所有できる。大昔の個人サイトにあった掲示板のような使い方を想定。

### 掲示板
![image](https://user-images.githubusercontent.com/19220989/59559397-6f887a80-9041-11e9-870e-997a141ac7b4.png)

名の通り普通の掲示板。とは言うけれど実際にはソケット通信でリアルタイムに更新されるのでチャットに近い。

### 感情分類掲示板
![image](https://user-images.githubusercontent.com/19220989/59559413-c8f0a980-9041-11e9-880f-393c1da764bb.png)

各投稿に対し、ナイーブベイズによる単純な「（´・ω・｀）」「(｀・ω・´)」分類が行える掲示板。機械学習の練習用に作った。

### 画像分類掲示板
![image](https://user-images.githubusercontent.com/19220989/59559421-07866400-9042-11e9-8a46-be9b6f3ca051.png)

意味なくCNNによる画像分類ができる掲示板。やっぱり機械学習の練習用に作った。

### 生放送
![image](https://user-images.githubusercontent.com/19220989/59559439-4a483c00-9042-11e9-812e-942c9b1a322a.png)

WebRTCによる生放送機能。新しいことを試したくて作った。

## ライセンス
Copyright © 2018 fukuchan

This software is licensed under the MIT License.
