use v5.10;
use strict;
use warnings qw\all\;

use Test::More;

plan tests => 1;

$ENV{npm_config_yes} = 'false';
my $file = 't/shouldCompile.ts';

my $out = `npx tsc --noEmit --pretty "$file"`;

is $?, 0, "« $file » compiles" or diag "Compiler output:\n", $out;
