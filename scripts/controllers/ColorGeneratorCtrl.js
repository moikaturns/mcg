"use strict";

mcgApp.controller('ColorGeneratorCtrl',
function ($scope, $mdDialog, ColourLovers, $rootScope)
{
	$scope.init = function ()
	{
		// Reset palette to default color
		$scope.setDefaultPalette();

		// Define palettes
		$scope.palettes = [];
		$scope.colourlovers = [];

		// Add base palette
		$scope.addBasePalette();

		// Define theme defaults
		$scope.theme = {
			name: '',
            palettes: $scope.palettes
		};
	};

	$rootScope.setPalettesByColors = function(colors){
		$scope.palettes = [];
		angular.forEach(colors, function( value ){
			$scope.palette.base = '#'+ value;
			$scope.addBasePalette();
		});
		$scope.setDefaultPalette();
	};

	// Function to add a palette to palettes.
	$scope.addBasePalette = function(){
		$scope.palettes.push(angular.copy($scope.palette));
		$scope.calcPalette($scope.palettes.length-1);

		// GA Event Track
		ga('send', 'event', 'mcg', 'add_palette');
	};

	// Function to reset palette back to default.
	$scope.setDefaultPalette = function () {
		// Define base palette
		$scope.palette = {
			colors: [],
			orig:   [],
			base:   '#26a69a',
			json:   '',
			name:   ''
		};
	};

	// Function to calculate all colors for all palettes
	$scope.calcPalettes = function(){
		for(var i = 0; i < $scope.palettes.length; i++){
			$scope.calcPalette(i);
		}
	};

	// Function to delete a palette when passed it's key.
	$scope.deletePalette = function(key){
		$scope.palettes.remove(key);
		// GA Event Track
		ga('send', 'event', 'mcg', 'remove_palette');
	};

	// Function to assign watchers to all bases
	$scope.calcPalette = function(key){
		$scope.palettes[key].orig = $scope.computeColors($scope.palettes[key].base);
		$scope.palettes[key].colors = $scope.palettes[key].orig;
	};

	// Function to make the definePalette code for a palette.
	$scope.createDefinePalette = function(palette){
		return '$mdThemingProvider.definePalette(\'' + palette.name + '\', ' + $scope.makeColorsJson(palette.colors) + ');';
	};

	// Function to make an exportable json array for themes.
	$scope.makeColorsJson = function(colors){
		var exportable = {};
		angular.forEach(colors, function(value, key){
			exportable[value.name] = value.hex;
		});
		return angular.toJson(exportable, null, 4);
	};

	// Function to calculate all colors from base
	$scope.computeColors = function(hex)
	{
		// Return array of color objects.
		return [
			{ hex : tinycolor( hex ).lighten( 52 ).toHexString(), name : '50' },
			{ hex : tinycolor( hex ).lighten( 37 ).toHexString(), name : '100' },
			{ hex : tinycolor( hex ).lighten( 26 ).toHexString(), name : '200' },
			{ hex : tinycolor( hex ).lighten( 12 ).toHexString(), name : '300' },
			{ hex : tinycolor( hex ).lighten( 6 ).toHexString(), name : '400' },
			{ hex : hex, name : '500' },
			{ hex : tinycolor( hex ).darken( 6 ).toHexString(), name: '600' },
			{ hex : tinycolor( hex ).darken( 12 ).toHexString(), name: '700' },
			{ hex : tinycolor( hex ).darken( 18 ).toHexString(), name: '800' },
			{ hex : tinycolor( hex ).darken( 24 ).toHexString(), name: '900' },
			{ hex : tinycolor( hex ).lighten( 52 ).toHexString(), name: 'A100' },
			{ hex : tinycolor( hex ).lighten( 37 ).toHexString(), name: 'A200' },
			{ hex : tinycolor( hex ).lighten( 6 ).toHexString(), name: 'A400' },
			{ hex : tinycolor( hex ).darken( 12 ).toHexString(), name: 'A700' }
		];
	};

    // Function to show theme's full code
    $scope.showThemeCode = function()
    {
	    // Check to see that a theme name and palette names are set.
	    if(
		    typeof $scope.theme.name === 'undefined' || $scope.theme.name.length < 1 ||
		    typeof $scope.palettes[0] === 'undefined' || typeof $scope.palettes[0].name === 'undefined' || $scope.palettes[0].name.length < 1 ||
		    typeof $scope.palettes[1] === 'undefined' || typeof $scope.palettes[1].name === 'undefined' || $scope.palettes[1].name.length < 1
	    ){
		    alert('To generate the code for a theme you must provide a theme name and at least two palettes with names.');
		    return false;
	    }

        // Init return string
        var themeCodeString = '';

        // For each palette, add it's declaration
        for(var i = 0; i < $scope.palettes.length; i++){
            themeCodeString = themeCodeString+$scope.createDefinePalette($scope.palettes[i])+'\n\r';
        }

        // Add theme configuration
        themeCodeString = themeCodeString +
        '$mdThemingProvider.theme(\'' + $scope.theme.name + '\')\n\r\t'+
        '.primaryPalette(\''+$scope.palettes[0].name+'\')\n\r\t'+
        '.accentPalette(\''+$scope.palettes[1].name+'\');'
        +'\n\r';

        // Show clipboard with theme code
        $scope.showClipboard(themeCodeString);

	    // GA Event Track
	    ga('send', 'event', 'mcg', 'copy_code_theme');
    };

	// Function to regenerate json and show dialog for palette.
	$scope.showPaletteCode = function(palette)
	{
		// Check to see that this palette has a name
		if (
			typeof palette === 'undefined' ||
			typeof palette.name === 'undefined' ||
			palette.name.length < 1
		) {
			alert('To generate the code for a palette the palette must have a name.');
			return false;
		}

		// Generate palette's code
		palette.json = $scope.createDefinePalette(palette);

		// Show code
		$scope.showClipboard(palette.json);

		// GA Event Track
		ga('send', 'event', 'mcg', 'copy_code_palette');
	};

    // Function to show export json for loading carts later
    $scope.showExport = function(){
        $scope.showClipboard(angular.toJson($scope.theme, null, 2));
    };

	// Function to show generic clipboard alert dialog
	$scope.showClipboard = function(code){
		$mdDialog.show({
			template   : '<md-dialog aria-label="Clipboard dialog">' +
			'  <md-content>' +
			'    <pre>{{code}}</pre>' +
			'  </md-content>' +
			'  <div class="md-actions">' +
			//'    <md-button id="copy-to-clipboard" data-clipboard-text="{{code}}">' +
			//'      Copy To Clipboard' +
			//'    </md-button>' +
			'    <md-button ng-click="closeDialog()">' +
			'      Close' +
			'    </md-button>' +
			'  </div>' +
			'</md-dialog>',
			locals     : {
				code: code
			},
			controller : ClipboardDialogController
		});

		// GA Event Track
		ga('send', 'event', 'mcg', 'copy_code');

		function ClipboardDialogController($scope, $mdDialog, code)
		{
			$scope.code = code;
			$scope.closeDialog = function () {
				$mdDialog.hide();
			};

			// Configure Zero Clipboard
			var client = new ZeroClipboard(document.getElementById('copy-to-clipboard'));
			client.on('ready', function (event) {
				client.on('copy', function (event) {
					$scope.closeDialog();
				});
			});
		}
	};

	// Function to show generic clipboard alert dialog
	$scope.showColourLovers = function () {
		$mdDialog.show( {
			templateUrl: '/templates/dialogs/colourlovers.html',
			controller: ColourLoversDialogController
		} );

		// GA Event Track
		ga( 'send', 'event', 'mcg', 'view_colourlovers' );

		function ColourLoversDialogController( $scope, $mdDialog, ColourLovers )
		{
			$scope.init = function(){
				$scope.colourlovers = [];
				$scope.setColors = $rootScope.setPalettesByColors;
				$scope.getTop();
			};

			// Get top colourlover palettes.
			$scope.getTop = function(){
				ColourLovers.getTop().success( function ( data ) {
					$scope.colourlovers = data;
				} );
			};

			// Get new colourlover palettes.
			$scope.getNew = function () {
				ColourLovers.getNew().success( function ( data ) {
					$scope.colourlovers = data;
				} );
			};

			// Get random colourlover palettes.
			$scope.getRandom = function () {
				ColourLovers.getRandom().success( function ( data ) {
					$scope.colourlovers = data;
				} );
			};

			// Function to close dialog
			$scope.closeDialog = function () {
				$mdDialog.hide();
			};

			$scope.init();
		}
	};

    // Function to darken a palette's color.
    $scope.darkenPaletteItem = function(color){
        color.hex = shadeColor(color.hex, -0.1);
    };

    // Function to lighten a palette's color.
    $scope.lightenPaletteItem = function(color){
        color.hex = shadeColor(color.hex, 0.1);
    };

	// Init controller
	$scope.init();
});
