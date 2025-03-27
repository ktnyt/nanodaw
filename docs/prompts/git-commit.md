以下のルールに従って git commit を作成して！

## 流れ

### 1. フォーマッター、リンター、テストを実行する

```sh
bun run format
bun run lint
bun run check
```

### 2. レポジトリの状態を確認する

```sh
git status -sb
```

### 3. 変更のあるファイルの diff を確認する

```sh
git diff | cat
```

### 4. 関連するファイルを add する

```sh
git add .  # すべてのファイルが関連する場合
git add file1 file2 ...  # 特定のファイルのみが関連する場合
```

### 5. 過去のコミットメッセージの形式を確認する

```sh
git log --oneline | head -n 20
```

### 6. コミットを作成する

```sh
git commit -m "[One line commit message...]"
```

## Important rules

- コミットメッセージは GitMoji を使用してください
