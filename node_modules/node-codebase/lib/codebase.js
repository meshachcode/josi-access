var https = require('https');
var xml2js = require('xml2js');

function getType(obj){
    return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1];
}

function addParams(postData, params) {
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            postData += '<' + key + ((getType(params[key]) === 'Number') ? ' type="integer"' : '') + '>' + params[key] + '</' + key + '>';
        }
    }

    return postData;

    console.log(postData);
}

var Codebase = function (url, key) {
    var self = this;
    this.host = url;
    this.key = key;

    this.api = {
        activity: function (callback) {
            return self.request({
                path: '/activity',
                method: 'GET',
                callback: callback
            });
        },
        projects: {
            all: function (callback) {
                return self.request({
                    path: '/projects',
                    method: 'GET',
                    callback: callback
                });
            },
            specific: function (permalink, callback) {
                // permalink: example 'project-name' this is not the integer id
                return self.request({
                    path: '/' + permalink,
                    method: 'GET',
                    callback: callback
                });
            },
            create: function (project_name, callback) {
                // project_name: example 'Project Name'
                return self.request({
                    path: '/create_project',
                    method: 'POST',
                    callback: callback,
                    postData: '<project><name>' + project_name + '</name></project>'
                });
            },
            deleteProject: function (permalink, callback) {
                // permalink: example 'project-name' this is not the integer id
                return self.request({
                    path: '/' + permalink,
                    method: 'DELETE',
                    callback: callback
                });
            },
            groups: function (callback) {
                return self.request({
                    path: '/project_groups',
                    method: 'GET',
                    callback: callback
                });
            },
            users: {
                all: function (permalink, callback) {
                    // permalink: example 'project-name' this is not the integer id
                    return self.request({
                        path: '/' + permalink + '/assignments',
                        method: 'GET',
                        callback: callback
                    });
                },
                set: function (permalink, users, callback) {
                    // permalink: example 'project-name' this is not the integer id
                    // users: is an array of user ids (integer)

                    console.log('Note: This method is not working on the codebase API.');

                    var postData = '<users>';
                    for (var i = 0; i < users.length; i++) {
                        postData += '<user><id>' + users[i].toString() + '</id></user>';
                    }
                    postData += '</users>';

                    return self.request({
                        path: '/' + permalink + '/assignments',
                        method: 'POST',
                        callback: callback,
                        postData: postData
                    });
                }
            }
        },
        repositories: {
            all: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/repositories',
                    method: 'GET',
                    callback: callback
                });
            },
            specific: function (permalink, repo, callback) {
                // permalink: example 'project-name' this is not the integer id
                // repo: example 'repo-name' this is not the integer id
                return self.request({
                    path: '/' + permalink + '/' + repo,
                    method: 'GET',
                    callback: callback
                });
            },
            create: function (permalink, _args, callback) {
                /*  Required arguments include:
                    permalink: example 'project-name' this is not the integer id
                    Required Arguments {
                        name: The name of your repository
                        scm: SCM type of your repository (git)
                    }
                */
                return self.request({
                    path: '/' + permalink + '/repositories',
                    method: 'POST',
                    callback: callback,
                    postData: '<repository><name>' + _args.name + '</name><scm>' + _args.scm + '</scm></repository>'
                });
            },
            commits: {
                allCommitsForSpecificRef: function (permalink, _args, callback) {
                    return self.request({
                        path: '/' + permalink + '/' + _args.repo + '/commits/' + _args.ref,
                        method: 'GET',
                        callback: callback
                    });
                },
                allCommitsForSpecificRefForANamedPath: function (permalink, _args, callback) {
                    return self.request({
                        path: '/' + permalink + '/' + _args.repo + '/commits/' + _args.ref + '/' + _args.path,
                        method: 'GET',
                        callback: callback
                    });
                }
            },
            deployments: {
                create: function (permalink, _args, callback) {
                    /*  Required arguments include:
                        permalink: example 'project-name' this is not the integer id
                        Required Arguments {
                            repo: example 'repo-name' this is not the integer id
                            branch: The branch which you are deploying
                            revision: The reference of the revision/commit you are deploying. This must already exist in your repository and have been pushed to Codebase.
                            environment: The environment you are pushing to (used for reference only)
                            servers: List of servers which you are deploying to (multiple servers should be comma separated, e.g. app1.myapp.com, app2.myapp.com, app3.myapp.com)
                        }
                    */
                    return self.request({
                        path: '/' + permalink + '/' + _args.repo + '/deployments',
                        method: 'POST',
                        callback: callback,
                        postData: '<deployment><branch>' + _args.branch + '</branch><revision>' + _args.revision + '</revision><environment>' + _args.environment + '</environment><servers>' + _args.servers + '</servers></deployment>'


                    });
                }
            },
            files: {
                fileContentsForAParticularPathWithinARef: function (permalink, _args, callback) {
                    return self.request({
                        path: '/' + permalink + '/' + _args.repo + '/blob/' + _args.ref + '/' + _args.path,
                        method: 'GET',
                        download: true,
                        callback: callback
                    });
                },
                fileContentsByBlobSHA: function (permalink, _args, callback) {
                    return self.request({
                        path: '/' + permalink + '/' + _args.repo + '/blob/' + _args.ref,
                        method: 'GET',
                        download: true,
                        callback: callback
                    });
                }
            },
            hooks: {
                all: function (permalink, repo, callback) {
                    return self.request({
                        path: '/' + permalink + '/' + repo + '/hooks',
                        method: 'GET',
                        callback: callback
                    });
                },
                create: function (permalink, _args, callback) {
                    /*  Required arguments include:
                        permalink: example 'project-name' this is not the integer id
                        Arguments {
                            id: is the ID of the hook
                            url: is the URL where the hook will be delivered to
                            username: is the username that will be used for basic auth (if any) when making the request
                            password: is the password that will be used for basic auth (if any) when making the request
                        }
                    */

                    var postData = '';

                    postData += '<repository-hook>';
                    postData += '<id type="integer">' + _args.id + '</id>';
                    postData += '<url>' + _args.url + '</url>';
                    if (_args.username !== undefined) {
                        postData += '<username>' + _args.username + '</username>';
                    }
                    if (_args.password !== undefined) {
                        postData += '<password>' + _args.password + '</password>';
                    }
                    postData += '</repository-hook>';

                    return self.request({
                        path: '/' + permalink + '/' + _args.repo + '/hooks',
                        method: 'POST',
                        callback: callback,
                        postData: postData


                    });
                }
            }
        },
        tickets: {
            all: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/tickets',
                    method: 'GET',
                    callback: callback
                });
            },
            allQuery: function (permalink, _args, callback) {
                // Remember status 404 means that the search did not return any queries.
                return self.request({
                    path: '/' + permalink + '/tickets?query=' + _args.query + ((_args.page !== undefined) ? '&page=' + _args.page : ''),
                    method: 'GET',
                    callback: callback
                });
            },
            create: function (permalink, _args, callback) {
                
                var postData = '';

                postData += '<ticket>';
                postData += '<summary>' + _args.summary + '</summary>';
                postData += '<description><![CDATA[' + _args.description + ']]></description>';
                postData = addParams(postData, _args.optParams);
                postData += '</ticket>';

                return self.request({
                    path: '/' + permalink + '/tickets',
                    method: 'POST',
                    callback: callback,
                    postData: postData
                });
            },
            allStatuses: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/tickets/statuses',
                    method: 'GET',
                    callback: callback
                });
            },
            allPriorities: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/tickets/priorities',
                    method: 'GET',
                    callback: callback
                });
            },
            allCategories: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/tickets/categories',
                    method: 'GET',
                    callback: callback
                });
            },
            notes: {
                all: function (permalink, ticket_id, callback) {
                    return self.request({
                        path: '/' + permalink + '/tickets/' + ticket_id + '/notes',
                        method: 'GET',
                        callback: callback
                    });
                },
                specific: function (permalink, _args, callback) {
                    /*  Required arguments include:
                        permalink: example 'project-name' this is not the integer id
                        Required Arguments {
                            ticket_id: The intiger value ticket id
                            note_id: The intiger value note id
                        }
                    */
                    return self.request({
                        path: '/' + permalink + '/tickets/' + _args.ticket_id + '/notes/' + _args.note_id,
                        method: 'GET',
                        callback: callback
                    });
                },
                create: function (permalink, _args, callback) {
                    /*  Required arguments include:
                        permalink: example 'project-name' this is not the integer id
                        Required Arguments {
                            ticket_id: The intiger value ticket id
                            content: A string
                        }
                        Arguments {
                            time-added: The intiger value representing minutes added to the ticket
                            changes: Pass in an object with keys matching those of valid properties from Codebase
                        }
                    */
                    var postData = '';

                    postData += '<ticket-note>';
                    postData += '<content><![CDATA[' + _args.content + ']]></content>';
                    if (_args['time-added'] !== undefined) {
                        postData += '<time-added>' + _args['time-added'] + '</time-added>';
                    }
                    postData += '<changes>';
                    postData = addParams(postData, _args.optParams);
                    postData += '</changes>';
                    postData += '</ticket-note>';
                    
                    return self.request({
                        path: '/' + permalink + '/tickets/' + _args.ticket_id + '/notes',
                        method: 'POST',
                        callback: callback,
                        postData: postData
                    });
                }
            },
            watchers: {
                all: function (permalink, ticket_id, callback) {
                    return self.request({
                        path: '/' + permalink + '/tickets/' + ticket_id + '/watchers',
                        method: 'GET',
                        callback: callback
                    });
                }
            },
            attachments: {
                upload: function (permalink, ticket_id, callback) {
                    // TODO: BUILD - Upload Attachement

                    console.log('PLEASE NOTE: THIS FUNCTION IS NOT BUILT YET.');
                    callback(true, {status: 'PLEASE NOTE: THIS FUNCTION IS NOT BUILT YET.'});
                    return false;

                    // var postData = '';

                    // return self.request({
                    //     path: '/' + permalink + '/tickets/' + ticket_id + '/attachments',
                    //     method: 'POST',
                    //     callback: callback,
                    //     postData: postData
                    // });
                }
            }

        },
        milestones: {
            all: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/milestones',
                    method: 'GET',
                    callback: callback
                });
            }
        },
        timeTracking: {
            all: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/time_sessions',
                    method: 'GET',
                    callback: callback
                });
            },
            today: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/time_sessions/day',
                    method: 'GET',
                    callback: callback
                });
            },
            week: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/time_sessions/week',
                    method: 'GET',
                    callback: callback
                });
            },
            month: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/time_sessions/month',
                    method: 'GET',
                    callback: callback
                });
            },
            specific: function (permalink, session_id, callback) {
                return self.request({
                    path: '/' + permalink + '/time_sessions/' + session_id,
                    method: 'GET',
                    callback: callback
                });
            },
            create: function (permalink, _args, callback) {

                var postData = '';

                postData += '<time-session>';
                postData += '<summary>' + _args.summary + '</summary>';
                postData += '<minutes type="integer">' + _args.minutes + '</minutes>';
                postData = addParams(postData, _args.optParams);
                postData += '</time-session>';

                return self.request({
                    path: '/' + permalink + '/time_sessions',
                    method: 'POST',
                    postData: postData,
                    callback: callback
                });
            },
            update: function (permalink, _args, callback) {
                var postData = '';

                postData += '<time-session>';
                postData += '<summary>' + _args.summary + '</summary>';
                postData += '<minutes type="integer">' + _args.minutes + '</minutes>';
                postData = addParams(postData, _args.optParams);
                postData += '</time-session>';

                return self.request({
                    path: '/' + permalink + '/time_sessions/' + session_id,
                    method: 'PUT',
                    postData: postData,
                    callback: callback
                });
            },
            deleteItem: function (permalink, session_id, callback) {
                return self.request({
                    path: '/' + permalink + '/time_sessions/' + session_id,
                    method: 'DELETE',
                    callback: callback
                });
            }
        },
        wiki: {
            all: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/wiki/index',
                    method: 'GET',
                    callback: callback
                });
            },
            specific: function (permalink, page, callback) {
                return self.request({
                    path: '/' + permalink + '/wiki/' + page,
                    method: 'GET',
                    callback: callback
                });
            }
        },
        publicKeys: {
            allUserKeys: function (username, callback) {
                return self.request({
                    path: '/users/' + username + '/public_keys',
                    method: 'GET',
                    callback: callback
                });
            },
            allUserKeysText: function (username, callback) {
                return self.request({
                    path: '/users/' + username + '/public_keys.txt',
                    method: 'GET',
                    download: true,
                    callback: callback
                });
            },
            allDeployKeys: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/public_keys',
                    method: 'GET',
                    callback: callback
                });
            },
            allDeployKeysText: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/public_keys.txt',
                    method: 'GET',
                    download: true,
                    callback: callback
                });
            },
            addNewUserKey: function (username, _args, callback) {
                var postData = '';

                postData += '<public-key>';
                postData += '<description>' + _args.description + '</description>';
                postData += '<key>' + _args.key + '</key>';
                postData += '</public-key>';

                return self.request({
                    path: '/users/' + username + '/public_keys',
                    method: 'POST',
                    postData: postData,
                    callback: callback
                });
            },
            addNewDeployKey: function (permalink, _args, callback) {
                var postData = '';

                postData += '<public-key>';
                postData += '<description>' + _args.description + '</description>';
                postData += '<key>' + _args.key + '</key>';
                postData += '</public-key>';

                return self.request({
                    path: '/' + permalink + '/public_keys',
                    method: 'POST',
                    postData: postData,
                    callback: callback
                });
            }
        },
        users: {
            all: function (callback) {
                return self.request({
                    path: '/users',
                    method: 'GET',
                    callback: callback
                });
            },
            roles: function (callback) {
                return self.request({
                    path: '/roles',
                    method: 'GET',
                    callback: callback
                });
            },
            create: function (_args, callback) {
                var postData = '';

                postData += '<user>';
                postData += '<first-name>' + _args.firstName + '</first-name>';
                postData += '<last-name>' + _args.lastName + '</last-name>';
                postData += '<email-address>' + _args.email + '</email-address>';
                postData = addParams(postData, _args.optParams);
                postData += '</user>';

                return self.request({
                    path: '/users',
                    method: 'POST',
                    postData: postData,
                    callback: callback
                });
            }
        },
        discussions: {
            all: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/discussions',
                    method: 'GET',
                    callback: callback
                });
            },
            allCategories: function (permalink, callback) {
                return self.request({
                    path: '/' + permalink + '/discussions/categories',
                    method: 'GET',
                    callback: callback
                });
            },
            create: function (permalink, _args, callback) {
                var postData = '';

                postData += '<discussion>';
                postData += '<subject>' + _args.subject + '</subject>';
                postData += '<category-id type="integer">' + _args.categoryId + '</category-id>';
                postData += '<content>' + _args.content + '</content>';
                postData = addParams(postData, _args.optParams);
                postData += '</discussion>';

                return self.request({
                    path: '/' + permalink + '/discussions',
                    method: 'POST',
                    postData: postData,
                    callback: callback
                });
            },
            specific: function (permalink, discussion, callback) {
                return self.request({
                    path: '/' + permalink + '/discussions/' + discussion + '/posts',
                    method: 'GET',
                    callback: callback
                });
            },
            addPost: function (permalink, _args, callback) {
                var postData = '';

                postData += '<discussion-post>';
                postData += '<content>' + _args.content + '</content>';
                postData = addParams(postData, _args.optParams);
                postData += '</discussion-post>';

                return self.request({
                    path: '/' + permalink + '/discussions/' + _args.discussion + '/posts',
                    method: 'POST',
                    postData: postData,
                    callback: callback
                });
            }
        }
    };

    return this.api;
};

Codebase.prototype.request = function (_args) {
    /*
        Required Args
        path, method, callback, postData
    */

    _args.method = (_args.method) ? _args.method : 'GET';

    function nicerKey(key) {
        return key.replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });
    }

    function normalise(input, key) {
        key = key || 'root';
        var type = getType(input);
        var norm = {};

        if (type != 'Object' && type != 'Array')
            return input;

        if (type == 'Array')
            norm = [];

        for (var sub in input) {
            if (sub == '@') continue;

            if (sub == '#') {
                switch (input[sub]) {
                    case 'false':
                        norm = false;
                        break;
                    case 'true':
                        norm = true;
                        break;
                    default:
                        norm = input[sub];
                        break;
                }
            } else {
                norm[nicerKey(sub)] = normalise(input[sub], sub);
            }
        }

        return norm;
    }

    if (getType(_args.method) !== 'String') {
        console.error('Codebase API error: HTTP Request method is not set.');
        _args.callback(true, {'status': 'Codebase API error: HTTP Request method is not set.'});
        return;
    }

    if (getType(_args.callback) !== 'Function') {
        console.error('Codebase API error: There is a problem with the function in the code.');
        _args.callback(true, {'status': 'There is a problem with the function in the code.'});
        return;
    }
 
    var options = {
        headers: {
            'Accept': 'application/xml',
            'Content-type': 'application/xml'
        },
        host: this.host,
        path: _args.path,
        method: _args.method,
        auth: this.key
    };

    var req = https.request(options, function (res) {

        var xml = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            xml += chunk;
        }).on('end', function () {
            if (res.statusCode !== 200 && res.statusCode !== 201) {
                console.error('Codebase API error: ' + res.statusCode + ' ' + options.path);
                _args.callback(true, {status: res.statusCode, data: xml});
                return;
            }

            if (_args.download === true) {
                _args.callback(false, xml);
            } else {
                var parser = new xml2js.Parser();
                parser.addListener('end', function (result) {
                    _args.callback(false, normalise(result));
                });
                parser.parseString(xml);
            }
        });
    });

    if (_args.method === 'POST' && _args.postData !== undefined) {
        req.write(_args.postData);
    }
    
    req.end();

    req.on('error', function(e) {
        console.error('Codebase API error: ' + e);
        _args.callback(true, {status: e});
    });

};

module.exports = Codebase;
