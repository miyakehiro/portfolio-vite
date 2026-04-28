#!/bin/bash
# assets/img フォルダを監視して、PNGが追加・更新されたらWebPに変換する
TARGET_DIR="./assets/img"

echo "WebP conversion watcher started for $TARGET_DIR..."

# 最初に一度、既存の全PNGをWebPに変換
find "$TARGET_DIR" -name "*.png" | while read file; do
  if [ ! -f "${file%.png}.webp" ] || [ "$file" -nt "${file%.png}.webp" ]; then
    cwebp -q 80 "$file" -o "${file%.png}.webp"
  fi
done

# 以降、ファイルの変更をリアルタイム監視
inotifywait -m -r -e close_write,create --format '%w%f' "$TARGET_DIR" | while read NEWFILE
do
    if [[ "$NEWFILE" == *.png ]]; then
        echo "Converting $NEWFILE to WebP..."
        cwebp -q 80 "$NEWFILE" -o "${NEWFILE%.png}.webp"
    fi
done