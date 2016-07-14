#!/bin/bash

set -e

rsync -a --delete dist/ ../sites/public/sdks/latest

echo 'Done'
