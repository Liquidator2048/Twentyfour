create virtual table torrents using fts5
(
    id,
    magnet UNINDEXED,
    title,
    info,
    cat_id,
    'date' UNINDEXED
);
vacuum;
pragma journal_mode = delete;
pragma page_size = 16384;
insert into torrents(torrents) values ('optimize');
vacuum;

attach database 'source.sqltie3' as 'SOURCEDB';
insert into torrents (id, magnet, title, info, cat_id, 'date')
    select distinct substr(magnet,21, 61) as id, magnet, title, info, t.cat_id, ''
    from SOURCEDB.torrents t
    where magnet is not null and magnet <> ''
;
detach database 'SOURCEDB';

vacuum;
pragma journal_mode = delete;
pragma page_size = 16384;
insert into torrents(torrents) values ('optimize');
vacuum;

.exit
.quit
