# manager-api 

## build

```shell
$ go build -o manager-api ../.
```

## Pre-dependence

### mysql

Install mysql in advance, and then initialize the database. e.g.

```shell
mysql –uroot –p123456 < ../script/db/schema.sql
```

### Start APISIX

[Install APISIX](https://github.com/apache/apisix#configure-and-installation)

### Set environment variables

According to your local deployment environment, modify the environment variables in `./run.sh`

## Run

```shell
$ sh run.sh
```


