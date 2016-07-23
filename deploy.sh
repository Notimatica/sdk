#!/bin/bash

set -e

rsync -a --delete dist/ ../sites/public/sdks/latest
rsync -a --delete ./example/assets/sdk-test ../sites/public/assets
cp ./example/index.html ../sites/resources/views/sdk-test.php
sed -i -e 's%/notimatica-sdk.js%https://cdn.notimatica.io/sdks/latest/notimatica-sdk.js%g' ../sites/resources/views/sdk-test.php

echo 'Done'
