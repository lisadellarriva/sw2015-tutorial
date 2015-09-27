/*
// ######################
//    LOAD STYLESHEETS
// ######################
*/

var bootstrapCSSLink = $('<link rel="stylesheet" type="text/css" href="http://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">');
var bootstrapThemeCSSLink = $('<link rel="stylesheet" type="text/css" href="http://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap-theme.min.css">');
var bootstrapJavaScriptLink = $('<script type="text/javascript" src="http://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>');

$('body').append(bootstrapCSSLink);
$('body').append(bootstrapThemeCSSLink);
$('body').append(bootstrapJavaScriptLink);	


/*
// ######################################################
//    SHOW/HIDE FUNCTIONALITY FOR REASONER EXPLANATION
// ######################################################
*/
$('#reasonerExplainerLink').on('click', function(e) {
	$('#reasonerExplainerLink').hide();
	$('#reasonerExplainer').show();
});

$('#reasonerExplainerHider').on('click', function(e) {
	$('#reasonerExplainerLink').show();
	$('#reasonerExplainer').hide();
});


/*
// ###################################################
//    DISABLE MEAT OPTIONS IF 'NO MEAT' IS SELECTED
// ###################################################
*/
$('input[name=hasMeat]').on('change', function(e) {
	if (this.checked) {
		$('input[name="sandwichMeat"]').each(function () {
            $(this).prop('disabled', true);
		});
	}
	else {
		$('input[name="sandwichMeat"]').each(function () {
            $(this).prop('disabled', false);
		});
	}
	
});


/*
// ##########################################
//    SPARQL QUERIES WITH/WITHOUT REASONER
// ##########################################
*/

$('#link14').on('click', function(e){
	
	var query = $('#query14').val();
	var endpoint = 'http://localhost:5820/tutorial/query';
	var format = 'JSON';
	
	var reasoner = false;
	if ($('#runReasonerCheckbox:checked').val()) {
		reasoner = true;
	} 
	
	$.get('/sparql',data={'endpoint': endpoint, 'query': query, 'format': format, 'reasoner': reasoner}, function(json){
		console.log(json);
		
		try {
			var vars = json.head.vars;
		
			var ul = $('<ul></ul>');
			ul.addClass('list-group');
		
			$.each(json.results.bindings, function(index,value){
				var li = $('<li></li>');
				li.addClass('list-group-item');
			
				$.each(vars, function(index, v){
					var v_type = value[v]['type'];
					var v_value = value[v]['value'];
				
					// If the value is a URI, create a hyperlink
					if (v_type == 'uri') {
						var a = $('<a></a>');
						a.attr('href',v_value);
						a.text(v_value);
						li.append(a);
					// Else we're just showing the value.
					} else {
						li.append(v_value);
					}
					li.append('<br/>');
					
				});
				ul.append(li);
			
			});
			
			$('#linktarget14').html(ul);
		} catch(err) {
			console.log(err);
			$('#linktarget14').html('Something went wrong!');
		}
	});
});


/*
// ####################################
//    LIST SANDWICHES BY PREFERENCES
// ####################################
*/

$('#list-sandwich-button').on('click', function(e){
	/* Get selected values for sandwich type and temperature */
	var swType = $('input[name=sandwichType]:checked').val();
	var swTemp = $('input[name=sandwichTemp]:checked').val();
	
	/* Get selected value for sandwich spiceness */
	var swSpicy = false;
	if($('input#swSpicy:checked').val()) {
		swSpicy = true;
	}
	
	/* Construct the query acording to the selected valeus */
	var query = 'PREFIX : <http://www.semanticweb.org/lisa/ontologies/2015/8/sandwich#> \n';
	query += 'SELECT ?y WHERE {';
	if (!swType && !swTemp) { 							//in case both type and temperature have none selected values
		query += '?x a :Sandwich .'						//return all sandwiches
	}
	else {
		if (swType) query += '?x a :' + swType + ' .';	//if any values for type, add it to query
		if (swTemp) query += '?x a :' + swTemp + ' .';	//if any values for temperature, add it to query
	}
	if (swSpicy) {										//if spiceness selected, add it to query
		query += '?x a :SpicySandwich .';
	}
	query += '?x rdfs:label ?y .';						//get the sandwiches' labels
	query += '}';	
	
	var endpoint = 'http://localhost:5820/tutorial/query';
	var format = 'JSON';
	var reasoner = true;
	
	$.get('/sparql',data={'endpoint': endpoint, 'query': query, 'format': format, 'reasoner': reasoner}, function(json){
		console.log(json);
		
		try {
			var vars = json.head.vars;
		
			var ul = $('<ul></ul>');
			ul.addClass('list-group');
		
			$.each(json.results.bindings, function(index,value){
				var li = $('<li></li>');
				li.addClass('list-group-item');
			
				$.each(vars, function(index, v){
					var v_type = value[v]['type'];
					var v_value = value[v]['value'];
				
					// If the value is a URI, create a hyperlink
					if (v_type == 'uri') {
						var a = $('<a></a>');
						a.attr('href',v_value);
						a.text(v_value);
						li.append(a);
					// Else we're just showing the value.
					} else {
						li.append(v_value);
					}
					li.append('<br/>');
					
				});
				ul.append(li);
			
			});
			
			$('#linktarget15').html(ul);
			$('#linktarget15').show();
		} catch(err) {
			console.log(err);
			$('#linktarget15').html('Something went wrong!');
			$('#linktarget15').show();
		}
	});
});


/*
// ######################
//    ADD NEW SANDWICH
// ######################
*/

$('#add-sandwich-button').on('click', function(e){
	/* Get selected values for new sandwich */
	var swName = $('input[name=sandwichName]').val();
	var swBread = $('input[name=sandwichBread]:checked').val();
	var swSauce = $('input[name=sandwichSauce]:checked');
	var swMeat = $('input[name=sandwichMeat]:checked');
	var swSalad = $('input[name=sandwichSalad]').val();
	var swTemp = $('input[name=sandwichTemp]:checked').val();
	var swHasMeat = true; 
	if ($('input[name=hasMeat]:checked').val()) {
		swHasMeat = false;
	}
	
	/* Generates new sandwich's id based on its name */
	var swId = swName.toLowerCase().replace(/ /g,"_");
	
	/* Constructs the query acording to the selected valeus */
	var query = 'PREFIX : <http://www.semanticweb.org/lisa/ontologies/2015/8/sandwich#> \n';
	query += 'INSERT DATA {';
	query += ':' + swId + ' a :Sandwich ;';
	query += 'rdfs:label "' + swName + '" ;';
	query += ':sandwichBreadType :' + swBread + ' ;';
	if (swSauce) {
		$.each(swSauce, function() {
			query += ':sandwichSauceFlavor :' + $(this).val() + ' ;';
		});
	}
	if (swHasMeat) {
		query += ':sandwichHasMeat :yes ;';
		if (swMeat) {
			$.each(swMeat, function() {
				query += ':sandwichMeatType :' + $(this).val() + ' ;';
			});
		}
	}
	else {
		query += ':sandwichHasMeat :no ;';
	}
	if (swSalad) {
		query += ':sandwichSalad "' + swSalad + '" ;';
	}
	query += ':sandwichIsHot :' + swTemp + ' .';
	query += '}';
		
	var endpoint = 'http://localhost:5820/tutorial/query';
	var format = 'JSON';
	var reasoner = false;
	
	$.get('/sparql',data={'endpoint': endpoint, 'query': query, 'format': format, 'reasoner': reasoner}, function(json){
		
		try {
			if (json) {
				$('#linktarget16').html('Yhumi! We have a new sandwich!!');
				$('#linktarget16').show();
			}	
		} catch(err) {
			console.log(err);
			$('#linktarget16').html('Something went wrong!');
			$('#linktarget16').show();
		}
	});
});
