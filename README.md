node-ssh-config-parser
======================

ssh-config parser


## Installation

    npm i --save ssh-config-parser

## Usage

Javascript:
    
    var fs = require('fs');
    var parser = require('ssh-config-parser');
    var config = fs.readFileSync('/Users/yolk/.ssh/config', 'utf8');
    
    var parsed = parser(config);

