var assert = require('assert');
var path = require('path');
var fs = require('fs');
var Promise = require("es6-promise").Promise;

var BroccoliProcessor = require("../libs/main.js");

var Broccoli = require('broccoli-html-editor');

function makeDefaultBroccoli(options, callback){
	options = options||{};
	var paths_module_template = options.paths_module_template || {
		'PlainHTMLElements': '../PlainHTMLElements/',
		'testMod1': '../modules1/',
		'testMod2': '../modules2/'
	};
	var contents_id = options.contents_id||'test1/test1';
	// console.log(contents_id);

	var broccoli = new Broccoli();
	broccoli.init(
		{
			'paths_module_template': paths_module_template,
			'documentRoot': path.resolve(__dirname, 'testdata/htdocs/')+'/',
			'pathHtml': '/'+contents_id+'.html',
			'pathResourceDir': '/'+contents_id+'_files/resources/',
			'realpathDataDir': path.resolve(__dirname, 'testdata/htdocs/'+contents_id+'_files/guieditor.ignore/')+'/',
			'customFields': {
				'custom1': function(broccoli){
					/**
					 * データをバインドする
					 */
					this.bind = function( fieldData, mode, mod, callback ){
						var php = require('phpjs');
						var rtn = ''
						if(typeof(fieldData)===typeof('')){
							rtn = php.htmlspecialchars( fieldData ); // ←HTML特殊文字変換
							rtn = rtn.replace(new RegExp('\r\n|\r|\n','g'), '<br />'); // ← 改行コードは改行タグに変換
						}
						if( mode == 'canvas' && !rtn.length ){
							rtn = '<span style="color:#999;background-color:#ddd;font-size:10px;padding:0 1em;max-width:100%;overflow:hidden;white-space:nowrap;">(ダブルクリックしてテキストを編集してください)</span>';
						}
						rtn = '<div style="background-color:#993; color:#fff; padding:1em;">'+rtn+'</div>';
						setTimeout(function(){
							callback(rtn);
						}, 0);
						return;
					}

				}
			} ,
			'bindTemplate': function(htmls, callback){
				var fin = '';
				fin += '<!DOCTYPE html>'+"\n";
				fin += '<html>'+"\n";
				fin += '    <head>'+"\n";
				fin += '        <meta charset="utf-8" />'+"\n";
				fin += '        <title>sample page</title>'+"\n";
				fin += '        <link rel="stylesheet" href="/common/css/common.css" />'+"\n";
				fin += '        <link rel="stylesheet" href="/common/css/module.css" />'+"\n";
				fin += '        <script src="/common/js/module.js"></script>'+"\n";
				fin += '        <style media="screen">'+"\n";
				fin += '            img{max-width:100%;}'+"\n";
				fin += '        </style>'+"\n";
				fin += '    </head>'+"\n";
				fin += '    <body>'+"\n";
				fin += '        <h1>sample page</h1>'+"\n";
				fin += '        <h2>main</h2>'+"\n";
				fin += '        <div class="contents" data-contents="main">'+"\n";
				fin += htmls['main']+"\n";
				fin += '        </div><!-- /main -->'+"\n";
				fin += '        <h2>secondly</h2>'+"\n";
				fin += '        <div class="contents" data-contents="secondly">'+"\n";
				fin += htmls['secondly']+"\n";
				fin += '        </div><!-- /secondly -->'+"\n";
				fin += '        <footer>'+"\n";
				fin += '            <a href="/editpage/">top</a>, <a href="http://www.pxt.jp/" target="_blank">pxt</a>'+"\n";
				fin += '            <form action="javascript:alert(\'form submit done.\');">'+"\n";
				fin += '                <input type="submit" value="submit!" />'+"\n";
				fin += '            </form>'+"\n";
				fin += '        </footer>'+"\n";
				fin += '    </body>'+"\n";
				fin += '</html>'+"\n";
				fin += '<script data-broccoli-receive-message="yes">'+"\n";
				fin += 'window.addEventListener(\'message\',(function() {'+"\n";
				fin += 'return function f(event) {'+"\n";
				fin += 'if(event.origin!=\'http://127.0.0.1:8088\'){return;}// <- check your own server\'s origin.'+"\n";
				fin += 'var s=document.createElement(\'script\');'+"\n";
				fin += 'document.querySelector(\'body\').appendChild(s);s.src=event.data.scriptUrl;'+"\n";
				fin += 'window.removeEventListener(\'message\', f, false);'+"\n";
				fin += '}'+"\n";
				fin += '})(),false);'+"\n";
				fin += '</script>'+"\n";

				callback(fin);
				return;
			}
		},
		function(){
			callback(broccoli);
		}
	);
	return;
}

describe('再帰検索のテスト', function() {

	it("broccoli インスタンス初期化", function(done) {
		this.timeout(60*1000);

		makeDefaultBroccoli( {}, function(broccoli){
			// console.log(broccoli.options.documentRoot);
			// console.log(broccoli.realpathHtml);
			// console.log(broccoli.paths_module_template);

			assert.equal(typeof(broccoli.paths_module_template), typeof({}));
			assert.equal(broccoli.paths_module_template.testMod1, path.resolve(__dirname,'testdata/modules1/')+'/');
			assert.equal(broccoli.paths_module_template.testMod2, path.resolve(__dirname,'testdata/modules2/')+'/');

			done();
		} );
	});

	it("再帰的に検索する", function(done) {
		this.timeout(60*1000);

		makeDefaultBroccoli( {}, function(broccoli){
			// console.log(broccoli.options.documentRoot);
			// console.log(broccoli.realpathHtml);
			// console.log(broccoli.paths_module_template);

			var broccoliProcessor = new BroccoliProcessor(broccoli, {});
			broccoliProcessor.each(
				function( data, next ){
					console.log(data);
					next();
				},
				function(){
					console.log('finished.');
					assert.equal(1, 1);
				}
			);

			done();
		} );

	});
});
