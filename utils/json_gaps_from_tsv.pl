#!/usr/bin/perl -w

use strict;
use warnings;
use Smart::Comments;
use Carp;
use autodie qw(:all); 
use JSON;
main() unless (caller());



sub main
{
	my @questions;
	while (<>) {
		chomp;
		$_ =~ s{\t"}{\t}gx;
		$_ =~ s{"$}{}gx;
		my @bits = split (/\t/);
		next if $bits[0] eq "start";
		my %question;
		($question{'start'},$question{'gap'},$question{'end'}) = @bits;
		push @questions, \%question;
	}


	my $json = encode_json \@questions;
	print $json;
    return;
}
1;



