rm -rf bin
mkdir bin
/usr/lib/jvm/java-8-oracle/bin/javac -d bin -sourcepath src -cp libs/json-simple-1.1.1.jar src/by/bsu/up/chat/*.java
