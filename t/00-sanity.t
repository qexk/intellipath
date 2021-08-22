use v5.10;
use strict;
use warnings qw\all\;

use Test::More;
use version;

plan tests => 4;

$ENV{npm_config_yes} = 'false';

my $npm_version = `npm --version`;

is $?, 0, 'npm is installed' or BAIL_OUT 'npm: command not found';

`npx tsc --version` =~ /(\d+\.\d+\.\d+)/;

is $?, 0, 'TypeScript is installed' or BAIL_OUT 'tsc: not found';
ok $1, '`tsc --version` returned something';

my $tsc_version = version->declare($1);

cmp_ok $tsc_version, '>=', v4.1.0, '`tsc --version` is over v4.1.0';

note "Using npm version $npm_version";
note "Using TypeScript version $tsc_version";
