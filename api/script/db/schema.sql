-- this is a db script for init
CREATE DATABASE `manager`;
use `manager`;
CREATE TABLE `routes` (
  `id` varchar(64) NOT NULL unique,
  `name` varchar(200) NOT NULL unique, -- not support yet
  `description` varchar(200) DEFAULT NULL,
  `hosts` text,
  `uris` text,
  `upstream_nodes` text,
  `upstream_id` varchar(32) , -- fk
  `priority` int NOT NULL DEFAULT 0,
  `state` int NOT NULL DEFAULT 1, -- 1-normal 0-disable
  `content` text,
  `content_admin_api` text,
  `create_time` bigint(20),
  `update_time` bigint(20),

  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;
CREATE TABLE `ssls` (
  `id` char(36) NOT NULL DEFAULT '',
  `public_key` text NOT NULL,
  `snis` text NOT NULL,
  `validity_start` bigint(20) unsigned NOT NULL,
  `validity_end` bigint(20) unsigned NOT NULL,
  `status` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `create_time` bigint(20) unsigned NOT NULL,
  `update_time` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;