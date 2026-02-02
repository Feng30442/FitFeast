# FITFEAST 開発環境セットアップガイド

## 目次

- [Git](#git)
  - [ソースコードのダウンロード](#git-clone)
- [初期設定](#initialize)
  - [環境変数の設定](#initialize-env)
  - [開発コンテナの作成と起動](#initialize-container-setup)
  - [開発コンテナの停止](#initialize-container-stop)
- [VSCode](#vscode)
  - [拡張機能のインストール](#vscode-extensions)
- [開発](#develop)
- [pgweb の操作方法](#pgweb)
  - [ログイン](#pgweb-login)
  - [テーブルの確認](#pgweb-show-table)
  - [SQL の実行](#pgweb-execute-sql)

---

<a id="git"></a>

## Git

<a id="git-clone"></a>

### ソースコードのダウンロード

Ubuntu（WSL）ターミナルを開き、任意のディレクトリで以下を実行します。

```bash
git clone <FITFEASTのリポジトリURL>
cd <リポジトリ名>
code .
