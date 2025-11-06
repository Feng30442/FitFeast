FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# uv をインストール（pipのキャッシュは使わない）
RUN pip install --no-cache-dir uv

# 依存のみ先にコピーしてレイヤーキャッシュを効かせる
COPY requirements.txt ./

# 指定どおり requirements.txt からシステム環境へインストール
RUN uv pip install --system -r requirements.txt

# アプリ本体をコピー
COPY . .
