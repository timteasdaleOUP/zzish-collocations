#!/usr/bin/perl -w

use strict;
use warnings;
use Smart::Comments;
use Carp;
use autodie qw(:all); 
use JSON;
main() unless (caller());

# group JSON q & a pairs into arrays of 'q's grouped by 'a'
# input expects:
#{"q":"obstacle","a":"course"},
#{"q":"rugby","a":"field"},

sub main
{
	my %rev_hash;
	while (<>) { 
	#print STDERR $_;
		if ($_ =~ m/"q"\s*:\s*"([^"]+)"\s*,\s*"a"\s*:\s*"([^"]+)"/i) {
#		print STDERR $_;
			my $q = $1;
			my $a = $2;
			if (! defined $rev_hash{$a}) {
				$rev_hash{$a} = [ $q ];
			} else {
			 push $rev_hash{$a},  $q ;
			}
		}
	}	


	my $json = encode_json \%rev_hash;
	print $json;
    return;
}
1;



