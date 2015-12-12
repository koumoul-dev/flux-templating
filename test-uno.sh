echo "UNO!!"

iconv -t ascii -f utf8 ./templates/hello_world.txt | unoconv -f html --stdin --stdout
