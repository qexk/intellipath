use v5.10;
use strict;
use warnings qw\all\;

use Test::More;

plan tests => 1;

$ENV{npm_config_yes} = 'false';
my $file = 't/shouldNotCompile.ts';

my $out = `npx tsc --noEmit "$file"`;

isnt $?, 0, "« $file » does not compile";
