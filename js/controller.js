var rhasesQuestionsApp = angular.module('shadonizeApp', []);

var DEBUG = true;

rhasesQuestionsApp.controller('ShadonizeController', ['$scope', '$http', '$location', function($scope, $http, $location) {

	$scope.database = [];
	$scope.register = {};
	$scope.show_password_panel = true;
	$scope.new_register_panel = false;
	$scope.list_panel = false;

	$scope.password = '';
	$scope.confirmation = '';

	$scope.loadAndDecrypt = function() {
		password = $scope.password;
		confirmation = $scope.confirmation;
		if (password === '') {
			alert('Senha não pode ser em branco.');
			throw 'PasswordError';
		}
		if (password !== confirmation) {
			alert('Senha e confimação devem ser iguais.');
			throw 'PasswordError';
		}

		$scope.loadDatabase(function(err) {
            if (err)
				throw 'Erro when system try load database. ' + err;

            $scope.$apply(function(){
				$scope.show_password_panel = false;
			    $scope.list_panel = true;
            });
		});
	}

	$scope.encryptAndSave = function() {
		console.log("Encrypting registers...");
		if (DEBUG) {
			console.log("Ciphering with password " + $scope.password + ":");
			console.log($scope.database);
		}
		encrypted = encrypt(JSON.stringify($scope.database), $scope.password);
		console.log("Register encrypted.");
		if (DEBUG) {
			console.log("Ciphering: ");
			console.log(encrypted);
		}

		console.log("Uploading file 'pass.data' to Google Drive...");
		uploadFile(encrypted);
		console.log("File 'pass.data' uploaded to Google Drive...");
	}

	$scope.loadDatabase = function(callback) {
		//data = getFile();
		console.log("Downloading file 'pass.data' from Google Drive...");
		data  = downloadPassdataFile(function(data) {
			if (!data) {
				//insertFile('');
				console.log("Can not found 'pass.data'.");
                $scope.$apply(function(){
				    $scope.database = [];
                });
				callback();
				return;
			}
			console.log("File 'pass.data' downloaded from Google Drive.");

			console.log("Decrypting file 'pass.data'...");
            $scope.$apply(function(){
				while (typeof(data) != "string") {
					data = JSON.stringify(data);
				}

				if (DEBUG) {
					console.log("Decyphering with password " + $scope.password + ":");
					console.log(data);
				}
				decrypted = decrypt(data, $scope.password);
				if (DEBUG) {
					console.log("Decrypted is: ");
					console.log(decrypted);
				}
				while (typeof(decrypted) == "string") {
					decrypted = JSON.parse(decrypted);
				}
				if (DEBUG) {
					console.log(decrypted);
				}

    			$scope.database = decrypted;
                console.log($scope.database);
            });
			console.log("File 'pass.data' decrypted.");

			callback();
		});

	}

	$scope.addRegister = function() {
		// TODO: validar campos
        console.log($scope.database);
		$scope.database.push($scope.register);
		$scope.register = {};
		$scope.new_register_panel = false;
		console.log("Registro salvo com sucesso.");
	}

	$scope.removeRegister = function(reg) {
		$scope.database.splice($scope.database.indexOf(reg), 1);
		console.log("Registro removido com sucesso.");
	}
}]);
