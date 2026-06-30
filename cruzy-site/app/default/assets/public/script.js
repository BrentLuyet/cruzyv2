function updateFavicon() {
	const favicon = document.getElementById("favicon");
	const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const currentHref = favicon.href;
	const newFileName = isDarkMode ? "favicon-dark.png" : "favicon-light.png";
	favicon.href = currentHref.replace(/[^\/]+$/, newFileName);
}
updateFavicon();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateFavicon);

function pseudoClick(parentElem, event) {
	var beforeClicked, afterClicked;
	var parentLeft = parseInt(parentElem.getBoundingClientRect().left, 10),
		parentTop = parseInt(parentElem.getBoundingClientRect().top, 10);
	var parentWidth = parseInt(window.getComputedStyle(parentElem).width, 10),
		parentHeight = parseInt(window.getComputedStyle(parentElem).height, 10);
	var before = window.getComputedStyle(parentElem, ':before');
	var beforeStart = parentLeft + (parseInt(before.getPropertyValue("left"), 10)),
		beforeEnd = beforeStart + parseInt(before.width, 10);
	var beforeYStart = parentTop + (parseInt(before.getPropertyValue("top"), 10)),
		beforeYEnd = beforeYStart + parseInt(before.height, 10);
	var after = window.getComputedStyle(parentElem, ':after');
	var afterStart = parentLeft + (parseInt(after.getPropertyValue("left"), 10)),
		afterEnd = afterStart + parseInt(after.width, 10);
	var afterYStart = parentTop + (parseInt(after.getPropertyValue("top"), 10)),
		afterYEnd = afterYStart + parseInt(after.height, 10);
	var mouseX = event.clientX,
		mouseY = event.clientY;
	beforeClicked = (mouseX >= beforeStart && mouseX <= beforeEnd && mouseY >= beforeYStart && mouseY <= beforeYEnd ? true : false);
	afterClicked = (mouseX >= afterStart && mouseX <= afterEnd && mouseY >= afterYStart && mouseY <= afterYEnd ? true : false);
	return {
		"before": beforeClicked,
		"after": afterClicked
	};
}

function isPseudoElementClicked(parentElem, event, pseudo) {
	var parentRect = parentElem.getBoundingClientRect();
	var pseudoStyle = window.getComputedStyle(parentElem, pseudo);
	var pseudoRect = {
		left: parentRect.left + parseInt(pseudoStyle.left, 10),
		top: parentRect.top + parseInt(pseudoStyle.top, 10),
		width: parseInt(pseudoStyle.width, 10),
		height: parseInt(pseudoStyle.height, 10)
	};
	return (event.clientX >= pseudoRect.left && event.clientX <= (pseudoRect.left + pseudoRect.width) &&
		event.clientY >= pseudoRect.top && event.clientY <= (pseudoRect.top + pseudoRect.height));
}

function checkAOS() {
	if (window.innerWidth < 1200) {
		AOS.init({ disable: true });
	} else {
		AOS.init({ disable: false });
	}
}
window.addEventListener('resize', checkAOS);
checkAOS();

jQuery(document).ready(function () {
	setTimeout(function () {
		jQuery("body").css({ 'overflow': 'hidden auto' });
		jQuery("#preloader").fadeOut();
	}, 2500);
	jQuery('.form-control').unmask();
	jQuery('input.form-control.datepicker').mask('00/00/0000');
	jQuery('input#user_zipcode').mask('AAAAAAA');
	jQuery('input#postal_code').mask('AAAAAAA');
	jQuery('a.confirm_leave').on('click', function (e) {
		e.preventDefault();
	});
});

jQuery('.confirm_leave').confirm({
	theme: 'supervan',
	icon: 'fa fa-spinner fa-spin',
	columnClass: 'col-md-6 col-md-offset-3',
	autoClose: 'Cancel|8000',
	title: 'Are you sure?',
	content: 'You are now leaving Cruzy Website',
	buttons: {
		Continue: function () {
			window.open(this.$target.attr('href'));
		},
		Cancel: function () {
			$.alert('Thank you for staying back');
		}
	}
});

$(document).ready(function () {
	$('form').not('#newsletter-form').on('submit', function (e) {
		let form = this;
		let action = form.getAttribute('action') || '';
        if (!action.includes('/form/handle/')) {
            return;
        }
		e.preventDefault();
		grecaptcha.ready(function () {
			grecaptcha.execute('6LeNhlUrAAAAAECltOnq4fnZ5A-2ZmCiBNtKGarR', {action: 'submit'}).then(function (token) {
				let input = form.querySelector('input[name="g-recaptcha-response"]');
				if (!input) {
					input = document.createElement('input');
					input.type = 'hidden';
					input.name = 'g-recaptcha-response';
					form.appendChild(input);
				}
				input.value = token;
				form.submit();
			});
		});
	});
});

$(window).scroll(function () {
	if ($(this).scrollTop() > 50) {
		$('.scrolltop:hidden').stop(true, true).fadeIn();
	} else {
		$('.scrolltop').stop(true, true).fadeOut();
	}
	$(window).trigger('resize');
});

$(function () {
	$(".scroll").click(function () {
		$("html,body").animate({ scrollTop: $("body").offset().top }, "1000");
		return false;
	});
});

$(window).resize(function () {
});

$(document).ready(function () {
	$('.osld_wrap').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		dots: true,
		arrows: true,
		autoplay: true,
		autoplaySpeed: 10000,
		infinite: true,
		speed: 1000,
		rows: 0,
		adaptiveHeight: true,
		pauseOnHover: false,
		responsive: [
			{
				breakpoint: 1199,
				settings: {dots: false}
			}
		]
	});
	/*$('.cust-open_slik-prev').click(function () {
		$('.osld_wrap').slick('slickPrev');
	});
	$('.cust-open_slik-next').click(function () {
		$('.osld_wrap').slick('slickNext');
	});*/
	$('.all_ships_wrap').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		dots: false,
		arrows: false,
		autoplay: true,
		autoplaySpeed: 1500,
		infinite: true,
		speed: 1000,
		rows: 0,
		adaptiveHeight: true
	});
	$('.room_slick').slick({
		slidesToShow: 4,
		slidesToScroll: 1,
		dots: false,
		arrows: true,
		autoplay: true,
		autoplaySpeed: 3000,
		infinite: true,
		speed: 1000,
		rows: 0,
		adaptiveHeight: false,
		responsive: [
			{
				breakpoint: 1199,
				settings: { slidesToShow: 3 }
			},
			{
				breakpoint: 992,
				settings: { slidesToShow: 2 }
			},
			{
				breakpoint: 767,
				settings: { slidesToShow: 1 }
			}
		]
	});

	$('.activity_slick').slick({
		slidesToShow: 2,
		slidesToScroll: 1,
		dots: false,
		arrows: true,
		autoplay: true,
		autoplaySpeed: 3000,
		infinite: true,
		speed: 1000,
		rows: 0,
		adaptiveHeight: false,
		responsive: [
			{
				breakpoint: 1199,
				settings: { slidesToShow: 1 }
			}
		]
	});

	$('.dining_slick').slick({
		slidesToShow: 3,
		slidesToScroll: 1,
		dots: false,
		arrows: true,
		autoplay: true,
		autoplaySpeed: 3000,
		infinite: true,
		speed: 1000,
		rows: 0,
		adaptiveHeight: false,
		responsive: [
			{
				breakpoint: 1199,
				settings: { slidesToShow: 2 }
			},
			{
				breakpoint: 767,
				settings: { slidesToShow: 1 }
			}
		]
	});

	$('.entertaintment_slick').slick({
		slidesToShow: 4,
		slidesToScroll: 1,
		dots: false,
		arrows: true,
		autoplay: true,
		autoplaySpeed: 3000,
		infinite: true,
		speed: 1000,
		rows: 0,
		adaptiveHeight: false,
		responsive: [
			{
				breakpoint: 1199,
				settings: { slidesToShow: 3 }
			},
			{
				breakpoint: 992,
				settings: { slidesToShow: 2 }
			},
			{
				breakpoint: 767,
				settings: { slidesToShow: 1 }
			}
		]
	});
	$('.ship_detail_slick').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		dots: false,
		arrows: true,
		autoplay: true,
		autoplaySpeed: 3000,
		infinite: true,
		speed: 1000,
		fade: true,
		asNavFor: '.ship_detail_slick_thumb'
	});
	$('.ship_detail_slick_thumb').slick({
		slidesToShow: 4,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 3000,
		infinite: true,
		speed: 1000,
		asNavFor: '.ship_detail_slick',
		focusOnSelect: true,
		arrows: false
	});
	$('.main-slider').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: true,
		fade: true,
		asNavFor: '.thumbnail-slider'
	});
	$('.thumbnail-slider').slick({
		slidesToShow: 4,
		slidesToScroll: 1,
		asNavFor: '.main-slider',
		vertical: true,
		focusOnSelect: true,
		responsive: [
			{
				breakpoint: 575,
				settings: { vertical: false }
			}
		]
	});
	$('.bn_slick').slick({
		slidesToShow: 5,
		slidesToScroll: 1,
		dots: false,
		arrows: true,
		autoplay: true,
		autoplaySpeed: 3000,
		infinite: true,
		speed: 1000,
		rows: 0,
		adaptiveHeight: false,
		responsive: [
			{
				breakpoint: 1199,
				settings: { slidesToShow: 3 }
			},
			{
				breakpoint: 767,
				settings: { slidesToShow: 1 }
			}
		]
	});
	$('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
		$('.ship_detail_slick').slick('refresh');
	});
	$('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
		$('.ship_detail_slick_thumb').slick('refresh');
	});
	if (window.innerWidth > 1200) {
		$('section#choose-ship-sec').awesomeCursor('ship', {
			color: '#fff',
			size: 32
		});
	}
	$('.form_wrap select.cust-select').niceSelect();
	$('.datepicker').daterangepicker({
		singleDatePicker: true,
		showDropdowns: false,
		autoUpdateInput: false,
		autoApply: true
	});
	$('.datepicker').on('apply.daterangepicker', function (ev, picker) {
		$(this).val(picker.startDate.format('MM/DD/YYYY'));
	});
	if ($('section#messages .alert').length > 0) {
		$('html, body').animate({ scrollTop: $('#messages').offset().top }, 'slow');
	}
	var urlp = location.href;
	$('footer#site_footer .footer_container .footer_col .quick_links ul li a').each(function () {
		if ($(this).attr('href') == urlp) {
			$(this).addClass('active');
		}
	});
	$('section#form_shipcnt .anim_card').hide();
	$('#form-ship input').on('keyup change', function () {
		const name = $('#name').val();
		const address = $('#address').val();
		const phone = $('#phone').val();
		const email = $('#email').val();
		$('input[name="hid_name"]').val(name);
		$('input[name="hid_address"]').val(address);
		$('input[name="hid_phone"]').val(phone);
		$('input[name="hid_email"]').val(email);
	});
	$('#form-make-a-payment input').on('keyup change', function () {
		const name = $('#name').val();
		const address = $('#address').val();
		const phone = $('#phone').val();
		const email = $('#email').val();
		$('input[name="hid_name"]').val(name);
		$('input[name="hid_address"]').val(address);
		$('input[name="hid_phone"]').val(phone);
		$('input[name="hid_email"]').val(email);
	});

	const $form = $('#form-ship');
	const $makeAPaymentForm = $('#form-make-a-payment');
	const $cardForm = $('#card-form');

	let promoApplied = false;
	window.promoApplied = promoApplied;
	$("#amount_breakdown").removeClass("hidden").show();
	$(".br-promo, .br-subtotal, .br-tax").addClass("hidden");

	function validateNoDuplicateEmails() {
		const primary = ( ($('#email').val() || '').trim().toLowerCase() );
		const $auInputs = $('.authorized_users_wrap .each_auth_user:not(.template) .authorized_email');
		const authEmails = $auInputs.map(function () {
			return (($(this).val() || '').trim().toLowerCase());
		}).get().filter(Boolean);
		const sameAsPrimaryIdx = authEmails.findIndex(e => e && e === primary);
		if (primary && sameAsPrimaryIdx !== -1) {
			const $offender = $auInputs.eq(sameAsPrimaryIdx);
			if ($offender.length) {
				const offenderId = $offender.attr('id') || 'authorized_email';
				$('#' + offenderId + '_error').text('This email matches the primary email. Use a different email for Authorized User.').show();
			}
			return { ok: false, msg: 'Primary email and Authorized User email cannot be the same.' };
		}
		const seen = new Set();
		for (let i = 0; i < authEmails.length; i++) {
			const e = authEmails[i];
			if (!e) continue;
			if (seen.has(e)) {
				const $dup = $auInputs.eq(i);
				if ($dup.length) {
					const dupId = $dup.attr('id') || 'authorized_email';
					$('#' + dupId + '_error').text('Duplicate email among Authorized Users. Each must be unique.').show();
				}
				return { ok: false, msg: 'Duplicate emails found among Authorized Users. Each must be unique.' };
			}
			seen.add(e);
		}
		return { ok: true };
	}

	function validateForm() {
		clearErrors();
		let isValid = true;
		const cardNumberRegex = /^\d{15,16}$/;
		const cvvRegex = /^\d{3,4}$/;
		const cardExpiryRegex = /^(0[1-9]|1[0-2])\/[0-9]{4}$/;
		const validations = {
			'first_name': {
				condition: val => val !== '',
				message: "First name is required"
			},
			'last_name': {
				condition: val => val !== '',
				message: "Last name is required"
			},
			'phone': {
				condition: val => val !== '',
				message: "Please enter a valid phone number"
			},
			'email': {
				condition: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
				message: "Please enter a valid email address"
			},
			'street1': {
				condition: val => val.length > 1 && val.length <= 100,
				message: "Street address must be 5-100 characters long"
			},
			'city': {
				condition: val => val.length >= 2 && val.length <= 50 && /^[a-zA-Z\s-']+$/.test(val),
				message: "Please enter a city"
			},
			'state': {
				condition: val => val !== '' || val === 'select',
				message: "Please select a state"
			},
			'postal_code': {
				condition: val => val !== '' && val.length <= 5,
				message: "Please enter a valid postal code"
			},
			'name_on_card': {
				condition: val => val !== '',
				message: "Card name is required"
			},
			'card_number': {
				condition: val => cardNumberRegex.test(val.replace(/\s/g, '')),
				message: "Please enter a valid card number (15-16 digits)"
			},
			'card_expiry': {
				condition: val => cardExpiryRegex.test(val.replace(/\s/g, '')),
				message: "Please enter a valid expiration date (MM/YYYY)"
			},
			'card_cvv': {
				condition: val => cvvRegex.test(val),
				message: "Please enter a valid CVV (3-4 digits)"
			}
		};
		Object.keys(validations).forEach(field => {
			const $field = $(`#${field}`);
			if ($field.length) {
				const value = $field.val() ? $field.val().trim() : '';
				if (!validations[field].condition(value)) {
					displayError(`${field}_error`, validations[field].message);
					isValid = false;
				}
			}
		});
		if (!$('input[name="terms_and_conditions[]"]').is(':checked')) {
			displayError('terms_error', "You must agree to the Terms and Conditions");
			isValid = false;
		}
		const dupChk = validateNoDuplicateEmails();
		if (!dupChk.ok) {
			isValid = false;
			Swal.fire({
				icon: 'warning',
				title: 'Fix email(s)',
				text: dupChk.msg,
				confirmButtonText: 'OK'
			});
		}
		if (!isValid) {
			Swal.fire({
				icon: 'warning',
				title: 'Missing Required Fields',
				text: 'Please enter all required fields',
				confirmButtonText: 'OK'
			});
		}
		return isValid;
	}

	function validateMakeAPaymentForm() {
		clearErrors();
		let isValid = true;
		const cardNumberRegex = /^\d{15,16}$/;
		const cvvRegex = /^\d{3,4}$/;
		const cardExpiryRegex = /^(0[1-9]|1[0-2])\/[0-9]{4}$/;

		const validations = {
			'first_name': {
				condition: val => val !== '',
				message: "First name is required"
			},
			'last_name': {
				condition: val => val !== '',
				message: "Last name is required"
			},
			'phone': {
				condition: val => val !== '',
				message: "Please enter a valid phone number"
			},
			'email': {
				condition: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
				message: "Please enter a valid email address"
			},
			'street1': {
				condition: val => val.length > 1 && val.length <= 100,
				message: "Street address must be 5-100 characters long"
			},
			'city': {
				condition: val => val.length >= 2 && val.length <= 50 && /^[a-zA-Z\s-']+$/.test(val),
				message: "Please enter a city"
			},
			'state': {
				condition: val => val !== '' || val === 'select',
				message: "Please select a state"
			},
			'postal_code': {
				condition: val => val !== '' && val.length <= 5,
				message: "Please enter a valid postal code"
			},
			'name_on_card': {
				condition: val => val !== '',
				message: "Card name is required"
			},
			'card_number': {
				condition: val => cardNumberRegex.test(val.replace(/\s/g, '')),
				message: "Please enter a valid card number (15-16 digits)"
			},
			'card_expiry': {
				condition: val => cardExpiryRegex.test(val.replace(/\s/g, '')),
				message: "Please enter a valid expiration date (MM/YYYY)"
			},
			'card_cvv': {
				condition: val => cvvRegex.test(val),
				message: "Please enter a valid CVV (3-4 digits)"
			}
		};
		Object.keys(validations).forEach(field => {
			const $field = $(`#${field}`);
			if ($field.length) {
				const value = $field.val() ? $field.val().trim() : '';
				if (!validations[field].condition(value)) {
					displayError(`${field}_error`, validations[field].message);
					isValid = false;
				}
			}
		});
		if (!$('input[name="terms_and_conditions[]"]').is(':checked')) {
			displayError('terms_error', "You must agree to the Terms and Conditions");
			isValid = false;
		}
		return isValid;
	}

	function displayError(elementId, message) {
		$(`#${elementId}`).text(message).show();
	}

	function clearErrors() {
		$('.error-message').text('').hide();
	}

	$form.on('submit', function (event) {
		event.preventDefault();
		const $submitButton = $('.btn_submit');
		if (validateForm()) {
			$submitButton.addClass('loading').attr('disabled', true);
			let formData = $form.serializeArray();
			formData.push({ name: 'promo_applied', value: (promoApplied ? 'true' : 'false') });
			const serializedData = $.param(formData);
			$.ajax({
				url: '/submitQB',
				method: 'POST',
				data: serializedData,
				dataType: 'json'
			}).done(function (data) {
				if (data.status === 'success') {
					processPayment();
				} else {
					Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Error saving data: ' + (data.message || 'Unknown error')
					}).then(() => {
						$submitButton.removeClass('loading').prop('disabled', false);
					});
				}
			}).fail(function (xhr, status, error) {
				Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'An error occurred while submitting the form: ' + error
				}).then(() => {
					$submitButton.removeClass('loading').prop('disabled', false);
				});
			}).always(function () {
			});
		}
	});

	function processPayment() {
		const $submitButton = $(".btn_submit");
		const payData = {
			_token: $('input[name="_token"]').val(),
			card_number: $("#card_number").val(),
			card_expiry: $("#card_expiry").val(),
			card_cvv: $("#card_cvv").val(),
			name_on_card: $("#name_on_card").val(),
			promo_code: $("#promo_code").val(),
			promo_applied: promoApplied ? "true" : "false"
		};
		Swal.fire({
			title: "Processing Payment",
			showConfirmButton: false,
			allowOutsideClick: false,
			willOpen: Swal.showLoading
		});
		$.ajax({
			url: "/authorizePayment",
			method: "POST",
			data: payData,
			dataType: "json"
		}).done(function (data) {
			if (data.paymentStatus === 1) {
				Swal.fire({
					icon: "success",
					title: "Success",
					text: "Payment Successful! Cruzy will contact you soon."
				}).then(() => {
					if (location.pathname == "/join-cruzy") window.location.href = "/";
					else if (location.pathname == "/renew-lounge") window.location.href = "/lounge";
					else if (location.pathname == "/renew-ascendant") window.location.href = "/ascendant";
					else if (location.pathname == "/renew-travalia") window.location.href = "/travalia";
					else window.location.href = "/";
				});
			} else {
				let title = "Error";
				if (data.errorType === "email_exists") title = "Email Already Registered";
				if (data.errorType === "payment_failure") title = "Payment Failed";
				Swal.fire({
					icon: "error",
					title: title,
					text: data.message
				}).then(() => repopulateForm(data.formData));
			}
		}).fail(function () {
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "An unexpected error occurred. Please try again."
			});
		}).always(function () {
			$submitButton.removeClass("loading").prop("disabled", false);
		});
	}

	$makeAPaymentForm.on('submit', function (event) {
		event.preventDefault();
		const $submitButton = $('.btn_submit');
		if (validateMakeAPaymentForm()) {
			$submitButton.addClass('loading').attr('disabled', true);
			let formData = $makeAPaymentForm.serializeArray();
			const serializedData = $.param(formData);
			$.ajax({
				url: '/submitPaymentQB',
				method: 'POST',
				data: serializedData,
				dataType: 'json'
			}).done(function (data) {
				if (data.status === 'success') {
					processMakeAPaymentForm();
				} else {
					Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Error saving data: ' + (data.message || 'Unknown error')
					}).then(() => {
						$submitButton.removeClass('loading').prop('disabled', false);
					});
				}
			}).fail(function (xhr, status, error) {
				Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'An error occurred while submitting the form: ' + error
				}).then(() => {
					$submitButton.removeClass('loading').prop('disabled', false);
				});
			}).always(function () {
			});
		}
	});

	function processMakeAPaymentForm() {
		const $submitButton = $('.btn_submit');
		const paymentData = {
			_token: $('input[name="_token"]').val(),
			card_number: $('#card_number').val(),
			card_expiry: $('#card_expiry').val(),
			card_cvv: $('#card_cvv').val(),
			name_on_card: $('#name_on_card').val(),
			payment_amount: $('input[name="payment_amount"]').val(),
		};
		Swal.fire({
			title: 'Processing Payment',
			showConfirmButton: false,
			allowOutsideClick: false,
			willOpen: Swal.showLoading
		});
		$.ajax({
			url: '/authorizeMakeAPayment',
			method: 'POST',
			data: paymentData,
			dataType: 'json'
		}).done(function (data) {
			if (data.paymentStatus === 1) {
				Swal.fire({
					icon: 'success',
					title: 'Success',
					text: 'Payment Successful! we will contact you soon.'
				}).then(() => window.location.href = '/');
			} else {
				let t = 'Error';
				if (data.errorType === 'email_exists') t = 'Email Already Registered';
				if (data.errorType === 'payment_failure') t = 'Payment Failed';
				Swal.fire({ icon: 'error', title: t, text: data.message }).then(() => repopulateForm(data.formData));
			}
		}).fail(() => {
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'An unexpected error occurred. Please try again.'
			});
		}).always(() => $submitButton.removeClass('loading').prop('disabled', false));
	}

	function repopulateForm(formData) {
		console.log('Repopulating form with data:', formData);
		for (let field in formData) {
			$(`#${field}`).val(formData[field]);
		}
		$('#card_number').val('');
		$('#card_expiry').val('');
		$('#card_cvv').val('');
	}

	var originalAmount = 0;
	if (window.location.pathname === '/make-a-payment' || window.location.pathname.includes('/payment-link')) {
		const amt = parseFloat($("#pls_amt_crz").text());
		if (!isNaN(amt)) {
			originalAmount = amt;
		}
	}

	if (window.location.pathname === '/join-cruzy') {
		$.ajax({
			url: '/get-cruzy-plus-amount',
			method: 'GET',
			dataType: 'json',
			success: function (data) {
				originalAmount = parseFloat(data.amount);
				$('.dynamic_amount').text(originalAmount.toFixed(2));
			},
			error: function (error) {
				console.error('Error fetching Cruzy+ amount:', error);
			}
		});
	}
	if (window.location.pathname === '/renew-lounge') {
		$.ajax({
			url: '/get-lounge-amount',
			method: 'GET',
			dataType: 'json',
			success: function (data) {
				originalAmount = parseFloat(data.amount);
				$('.dynamic_amount').text(originalAmount.toFixed(2));
			},
			error: function (error) {
				console.error('Error fetching Holidays Lounge amount:', error);
			}
		});
	}
	if (window.location.pathname === '/renew-ascendant') {
		$.ajax({
			url: '/get-ascendant-amount',
			method: 'GET',
			dataType: 'json',
			success: function (data) {
				originalAmount = parseFloat(data.amount);
				$('.dynamic_amount').text(originalAmount.toFixed(2));
			},
			error: function (error) {
				console.error('Error fetching Ascendant Holidays amount:', error);
			}
		});
	}
	if (window.location.pathname === '/renew-travalia') {
		$.ajax({
			url: '/get-travalia-amount',
			method: 'GET',
			dataType: 'json',
			success: function (data) {
				originalAmount = parseFloat(data.amount);
				$('.dynamic_amount').text(originalAmount.toFixed(2));
			},
			error: function (error) {
				console.error('Error fetching Club Travalia amount:', error);
			}
		});
	}

	const isBooking = ($("#booking_payment").val() == "1");
	if (isBooking) {
		$(".br-tax, .br-subtotal").addClass("hidden");
		window.skipTaxCalc = true;
	} else {
		window.skipTaxCalc = false;
	}

	function resetPromoUI() {
		const $amountEl = $('#pls_amt_crz');
		$amountEl.text(originalAmount.toFixed(2));
		$('#promo_code_message').removeClass('error-message success-message').text('').hide();
		promoApplied = false;
		window.promoApplied = false;
		$(document).trigger("promoAppliedChanged");
		$('#clear_promo_code').prop('disabled', true);
		//$('#promo_code').prop('disabled', false);
	}

	function parseMoney(v) {
		v = (v || "").toString().replace(/[^0-9.]/g, "");
		const n = parseFloat(v);
		return isNaN(n) ? 0 : n;
	}

	function formatMoney(n) {
		const v = parseFloat(n);
		if (isNaN(v)) return "0.00";
		return v.toFixed(2);
	}

	function getAffiliationForCurrentPage() {
		return ($('input[name="user_type"]').val() || $('input[name="user_type"]:checked').val() || "").trim();
	}

	function getAddressForCurrentPage() {
		return {
			line1: ($("#street1").val() || "").trim(),
			line2: ($("#street2").val() || "").trim(),
			city: ($("#city").val() || "").trim(),
			state: ($("#state").val() || "").trim(),
			postal: ($("#postal_code").val() || "").trim(),
			country: ($("#country").val() || "US").trim()
		};
	}

	function isAddressComplete(addr) {
		return (addr.line1 && addr.city && addr.state && addr.postal && addr.country);
	}

	let lastTaxRequest = null;
	let lastTaxTimer = null;

	function triggerTaxRecalc() {
		if (lastTaxTimer) clearTimeout(lastTaxTimer);
		lastTaxTimer = setTimeout(calculateAndUpdateTax, 450);
	}

	function calculateAndUpdateTax() {
		if (typeof window.promoApplied !== 'undefined') {
			promoApplied = !!window.promoApplied;
		}
		if (window.skipTaxCalc === true) {
			const currentAmount = parseMoney($("#pls_amt_crz").text());
			const baseAmount = parseMoney(originalAmount);
			let promoDiscount = 0;
			if (promoApplied) {
				promoDiscount = baseAmount - currentAmount;
				if (promoDiscount < 0) promoDiscount = 0;
			}
			$("#br_affiliation").text(`$${formatMoney(baseAmount)}`);
			if (promoApplied && promoDiscount > 0) {
				$(".br-promo").removeClass("hidden");
				$("#br_promo").text(`-$${formatMoney(promoDiscount)}`);
			} else {
				$(".br-promo").addClass("hidden");
			}
			$(".br-subtotal").addClass("hidden");
			$(".br-tax").addClass("hidden");
			$("#br_total").text(`$${formatMoney(currentAmount)}`);
			$("#tax_amount").val("0.00");
			$("#total_amount").val(formatMoney(currentAmount));
			$("#tax_estimate_ref").val("");
			return;
		}
		const affiliation = getAffiliationForCurrentPage();
		const addr = getAddressForCurrentPage();
		let affiliationAmount = parseMoney($("#pls_amt_crz").text());
		let promoDiscount = 0;
		if (promoApplied) {
			const base = parseMoney(originalAmount);
			const current = parseMoney($("#pls_amt_crz").text());
			promoDiscount = base - current;
			if (promoDiscount < 0) promoDiscount = 0;
		}
		const taxableSubtotal = affiliationAmount;
		$("#br_affiliation").text(`$${formatMoney(originalAmount)}`);
		if (promoApplied && promoDiscount > 0) {
			$(".br-promo").removeClass("hidden");
			$("#br_promo").text(`-$${formatMoney(promoDiscount)}`);
			$(".br-subtotal").removeClass("hidden");
		} else {
			$(".br-promo").addClass("hidden");
		}
		$("#br_subtotal").text(`$${formatMoney(taxableSubtotal)}`);
		$("#tax_subtotal").val(formatMoney(originalAmount));
		$("#tax_discount").val(formatMoney(promoDiscount));
		$("#taxable_subtotal").val(formatMoney(taxableSubtotal));
		if (!isAddressComplete(addr)) {
			$(".br-tax").addClass("hidden");
			if (promoApplied || addr.line1 || addr.city || addr.state || addr.postal) {
				$(".br-subtotal").removeClass("hidden");
			} else {
				$(".br-subtotal").addClass("hidden");
			}
			$("#br_tax").text("$0.00");
			$("#br_total").text(`$${formatMoney(taxableSubtotal)}`);
			$("#tax_amount").val("0.00");
			$("#total_amount").val(formatMoney(taxableSubtotal));
			$("#tax_estimate_ref").val("");
			$("#amount_breakdown").show();
			return;
		}
		if (lastTaxRequest && lastTaxRequest.abort) {
			try { lastTaxRequest.abort(); } catch (e) {}
		}
		lastTaxRequest = $.ajax({
			url: "/precharge/quote",
			method: "POST",
			headers: { "Accept": "application/json" },
			data: {
				_token: $('input[name="_token"]').val(),
				affiliation: affiliation || "Cruzy+",
				address_line1: addr.line1,
				address_line2: addr.line2,
				locality: addr.city,
				region: addr.state,
				postal_code: addr.postal,
				country: addr.country,
				client_subtotal: taxableSubtotal
			}
		}).done(function (q) {
			if (!q || !q.ok) {
				$("#br_tax").text("$0.00");
				$("#br_total").text(`$${formatMoney(taxableSubtotal)}`);
				return;
			}
			$(".br-subtotal, .br-tax").removeClass("hidden");
			$("#br_tax").text(`$${formatMoney(q.tax)}`);
			$("#br_total").text(`$${formatMoney(q.total)}`);
			$("#tax_amount").val(formatMoney(q.tax));
			$("#total_amount").val(formatMoney(q.total));
			$("#tax_estimate_ref").val(q.estimate_ref || "");
			$("#amount_breakdown").show();
		}).fail(function () {
			$("#br_tax").text("$0.00");
			$("#br_total").text(`$${formatMoney(taxableSubtotal)}`);
			$("#amount_breakdown").show();
		});
	}
	$("#street1, #street2, #city, #state, #postal_code, #country").on("input change", triggerTaxRecalc);
	$(document).on("promoAppliedChanged", function () {
		triggerTaxRecalc();
	});
	let originalAmountWatcher = setInterval(() => {
		const v = parseMoney($("#pls_amt_crz").text());
		if (v > 0) {
			clearInterval(originalAmountWatcher);
			triggerTaxRecalc();
		}
	}, 300);

	if (['/join-cruzy', '/renew-lounge', '/renew-ascendant', '/renew-travalia'].includes(window.location.pathname)) {
		$('#clear_promo_code').on('click', function () {
			resetPromoUI();
			$('#promo_code').val('');
		});
		$('#email, input[name="user_type"]').on('change input', function () {
			if (promoApplied) resetPromoUI();
		});
		$('#apply_promo_code').on('click', function () {
			const promoCode = ($('#promo_code').val() || '').trim();
			const email = ($('#email').val() || '').trim();
			const userType = ($('input[name="user_type"]').val() || $('input[name="user_type"]:checked').val() || '').trim();
			const $amountEl = $('#pls_amt_crz');
			const baseAmount = Number(originalAmount) || 0;
			if (!email) {
				Swal.fire({
					icon: 'warning',
					title: 'Email Required',
					text: 'Please enter your email address before applying a promo code.',
					confirmButtonText: 'OK'
				});
				return;
			}
			if (!promoCode) {
				$('#promo_code_message').text('').hide();
				$amountEl.text(baseAmount.toFixed(2));
				promoApplied = false;
				window.promoApplied = false;
				$(document).trigger("promoAppliedChanged");
				return;
			}
			if (!userType) {
				$('#promo_code_message').text('Please select your membership type first.').removeClass('success-message').addClass('error-message').show();
				$amountEl.text(baseAmount.toFixed(2));
				promoApplied = false;
				window.promoApplied = false;
				$(document).trigger("promoAppliedChanged");
				return;
			}
			if (promoApplied) {
				Swal.fire({
					icon: 'info',
					title: 'Promo Already Applied',
					text: 'You already have a promo applied. Do you want to clear it and apply a new one?',
					showCancelButton: true,
					confirmButtonText: 'Clear & Apply New',
					cancelButtonText: 'Cancel'
				}).then((result) => {
					if (result.isConfirmed) {
						const desiredCode = promoCode;
						$('#clear_promo_code').click();
						setTimeout(() => {
							$('#promo_code').val(desiredCode);
							$('#apply_promo_code').trigger('click');
						}, 200);
					}
				});
				return;
			}
			$('#apply_promo_code').prop('disabled', true);
			$.ajax({
				url: '/validate-promo-code',
				method: 'POST',
				data: {
					promo_code: promoCode,
					email: email,
					affiliation: userType,
					_token: $('input[name="_token"]').val()
				},
				headers: { 'Accept': 'application/json' }
			}).done(function (response) {
				const messageBox = $('#promo_code_message');
				if (response.used) {
					messageBox.text('Promo code already used with this email.').removeClass('success-message').addClass('error-message').show();
					$amountEl.text(baseAmount.toFixed(2));
					promoApplied = false;
					window.promoApplied = false;
					$(document).trigger("promoAppliedChanged");
					return;
				}
				if (!response.valid) {
					const msg = response.message || 'Invalid promo code.';
					messageBox.text(msg).removeClass('success-message').addClass('error-message').show();
					$amountEl.text(baseAmount.toFixed(2));
					promoApplied = false;
					window.promoApplied = false;
					$(document).trigger("promoAppliedChanged");
					return;
				}
				if (!Array.isArray(response.affiliations) || !response.affiliations.includes(userType)) {
					messageBox.text('This promo code is not valid for your membership type.').removeClass('success-message').addClass('error-message').show();
					$amountEl.text(baseAmount.toFixed(2));
					promoApplied = false;
					window.promoApplied = false;
					$(document).trigger("promoAppliedChanged");
					return;
				}
				let finalAmount = baseAmount;
				let promoText = '';
				if (response.type === 'trial') {
					finalAmount = 0.00;
					promoText = 'Valid promo code applied! You will have a 90-day free trial.';
				} else if (response.type === 'discount') {
					const discount = parseFloat(response.amount) || 0;
					finalAmount = Math.max(baseAmount - discount, 0.00);
					promoText = `Valid promo code applied!<br> $${discount.toFixed(2)} discount applied.`;
				} else if (response.type === 'bogo') {
					promoText = 'Valid promo code applied! You will get 1 extra year free.';
				} else {
					promoText = 'Promo applied.';
				}
				messageBox.html(promoText).removeClass('error-message').addClass('success-message').show();
				$amountEl.text(finalAmount.toFixed(2));
				promoApplied = true;
				window.promoApplied = true;
				$(document).trigger("promoAppliedChanged");
				$('#clear_promo_code').prop('disabled', false);
				//$('#promo_code').prop('disabled', true);
			}).fail(function (xhr) {
				let msg = 'Error validating promo code.';
				if (xhr.responseJSON && xhr.responseJSON.errors) {
					const errs = xhr.responseJSON.errors;
					const firstKey = Object.keys(errs)[0];
					if (firstKey && errs[firstKey] && errs[firstKey][0]) {
						msg = errs[firstKey][0];
					}
				}
				$('#promo_code_message').text(msg).removeClass('success-message').addClass('error-message').show();
				$amountEl.text(baseAmount.toFixed(2));
				promoApplied = false;
				window.promoApplied = false;
				$(document).trigger("promoAppliedChanged");
			}).always(function () {
				$('#apply_promo_code').prop('disabled', false);
			});
		});
	}

	$('#email').on('input blur', validateNoDuplicateEmails);
	$('.authorized_users_wrap').on('input blur', '.authorized_email', validateNoDuplicateEmails);
	$(document).on('click', '.add-authorized-user', function () {
		setTimeout(() => {
			$('.authorized_users_wrap .each_auth_user:not(.template) .authorized_email')
				.last()
				.on('input blur', validateNoDuplicateEmails);
		}, 0);
	});

	$('#form-ship').card({
		container: '.card-wrapper',
		formSelectors: {
			numberInput: 'input#card_number',
			expiryInput: 'input#card_expiry',
			cvcInput: 'input#card_cvv',
			nameInput: 'input#name_on_card'
		},
		placeholders: {
			number: '**** **** **** ****',
			name: 'Cruzy',
			expiry: '**/****',
			cvc: '***'
		}
	});
	$('#form-make-a-payment').card({
		container: '.card-wrapper',
		formSelectors: {
			numberInput: 'input#card_number',
			expiryInput: 'input#card_expiry',
			cvcInput: 'input#card_cvv',
			nameInput: 'input#name_on_card'
		},
		placeholders: {
			number: '**** **** **** ****',
			name: 'Cruzy',
			expiry: '**/****',
			cvc: '***'
		}
	});
	$('#payment-form-renewal').card({
		container: '.card-wrapper',
		formSelectors: {
			numberInput: 'input#card_number',
			expiryInput: 'input#card_expiry',
			cvcInput: 'input#card_cvv',
			nameInput: 'input#name_on_card'
		},
		placeholders: {
			number: '**** **** **** ****',
			name: 'Cruzy',
			expiry: '**/****',
			cvc: '***'
		}
	});

	$('form').not('#newsletter-form').submit(function(e) {
		if (e.isDefaultPrevented()) {
			return;
		}
		var $form = $(this);
		var $submitButton = $form.find('[type=submit]');
		$submitButton.prop('disabled', true).text('Processing...');
	});

});

$(document).ready(function () {
	if (window.location.hash) {
		var hash = window.location.hash;
		$('.nav-tabs .nav-link').removeClass('active');
		$('.tab-content .tab-pane').removeClass('active show');
		$('.nav-tabs a[data-bs-target="' + hash + '"]').addClass('active');
		$(hash).addClass('active show');
	}
	$('.nav-tabs .nav-link').on('click', function () {
		var target = $(this).data('bs-target');
		window.location.hash = target;
		$('.nav-tabs .nav-link').removeClass('active');
		$('.tab-content .tab-pane').removeClass('active show');
		$(this).addClass('active');
		$(target).addClass('active show');
	});
	$(window).on('hashchange', function () {
		var hash = window.location.hash;
		$('.nav-tabs .nav-link').removeClass('active');
		$('.tab-content .tab-pane').removeClass('active show');
		$('.nav-tabs a[data-bs-target="' + hash + '"]').addClass('active');
		$(hash).addClass('active show');
	});
});

$(document).ready(function () {
	if (window.innerWidth > 1200) {
		$('.dropdown').mouseover(function () {
			$(this).addClass('show').attr('aria-expanded', "true");
			$(this).find('.dropdown-menu').addClass('show');
		}).mouseout(function () {
			$(this).removeClass('show').attr('aria-expanded', "false");
			$(this).find('.dropdown-menu').removeClass('show');
		});
	}
	if (window.innerWidth < 1200) {
		$('ul li.dropdown.nav-item > a').on('click', function (event) {
			var clickedOnAfter = isPseudoElementClicked(this, event, ':after');
			if (clickedOnAfter) {
				event.preventDefault();
				var $parent = $(this).closest("li.dropdown.nav-item");
				var isExpanded = $parent.attr('aria-expanded') === "true";
				$parent.toggleClass('show', !isExpanded).attr('aria-expanded', !isExpanded);
				$parent.find('.dropdown-menu').toggleClass('show', !isExpanded);
			}
		});
	}
});

$(document).ready(function () {
	$('#edit-contact_email').on('click', function (event) {
		event.preventDefault();
		$('#current-email').toggle();
		$('#edit-email-input').toggle();
	});
	$('.add-travel-companion').on('click', function () {
		const formWrapper = $('.travel-companion-form-wrapper');
		if (formWrapper.is(':visible')) {
			const companionCount = $('.companion-details').length + 1;
			const newCompanion = formWrapper.find('.companion-details:first').clone();
			newCompanion.find('.card-title').text(`Travel Companion ${companionCount}`);
			newCompanion.find('input').val('');
			newCompanion.find('select').prop('selectedIndex', 0);
			newCompanion.appendTo('.companion-list');
		} else {
			formWrapper.slideDown();
		}
		$('input.form-control[type="tel"]').mask('(000) 000-0000');
	});
	$(document).on('click', '.delete-companion', function () {
		$(this).closest('.companion-details').remove();
		$('.companion-details .card-title').each(function (index) {
			$(this).text(`Travel Companion ${index + 1}`);
		});
	});

	const maxUsers = 3;
	let authorizedUserCount = $('.authorized_users_wrap .each_auth_user').not('.template').length;
	$('.add-authorized-user').on('click', function (event) {
		event.preventDefault();
		if (authorizedUserCount < maxUsers) {
			authorizedUserCount++;
			const newUser = $('.each_auth_user.template').clone().removeClass('template').show();
			newUser.find('.auth_user_title').text(`Authorized User ${authorizedUserCount} Information`);
			newUser.find('[id*="ID_PLACEHOLDER"]').each(function () {
				const currentId = $(this).attr('id');
				if (currentId) {
					const newId = currentId.replace('ID_PLACEHOLDER', authorizedUserCount);
					$(this).attr('id', newId);
				}
				const currentName = $(this).attr('name');
				if (currentName) {
					$(this).attr('name', currentName.replace('[]', `[${authorizedUserCount - 1}]`));
				}
			});
			newUser.find('label[for*="ID_PLACEHOLDER"]').each(function () {
				const currentFor = $(this).attr('for');
				if (currentFor) {
					const newFor = currentFor.replace('ID_PLACEHOLDER', authorizedUserCount);
					$(this).attr('for', newFor);
				}
			});
			newUser.appendTo('.authorized_users_wrap');
			const newPhoneInput = newUser.find('input.authorized_phone');
			if (newPhoneInput.length) {
				//newPhoneInput.mask('+000000000000000');
			}
		}
		if (authorizedUserCount >= maxUsers) {
			$(this).hide();
		}
	});
	$(document).on('click', '.delete-authorized-user', function () {
		$(this).closest('.each_auth_user').remove();
		authorizedUserCount--;
		$('.authorized_users_wrap .each_auth_user').not('.template').each(function (index) {
			const userNumber = index + 1;
			$(this).find('.auth_user_title').text(`Authorized User ${userNumber} Information`);
			$(this).find('[id*="authorized"]').each(function () {
				const currentId = $(this).attr('id');
				if (currentId) {
					const baseId = currentId.replace(/\d+$/, userNumber);
					$(this).attr('id', baseId);
				}
				const currentName = $(this).attr('name');
				if (currentName) {
					$(this).attr('name', currentName.replace(/\[\d+\]/, `[${index}]`));
				}
			});
			$(this).find('label[for*="authorized"]').each(function () {
				const currentFor = $(this).attr('for');
				if (currentFor) {
					const baseFor = currentFor.replace(/\d+$/, userNumber);
					$(this).attr('for', baseFor);
				}
			});
		});
		if (authorizedUserCount < maxUsers) {
			$('.add-authorized-user').show();
		}
	});
	$('#toggleAuthorizedUserForm').on('click', function (event) {
		event.preventDefault();
		$('#addAuthorizedUserForm').slideToggle();
		//$('#addAuthorizedUserForm input#authorized_phone').mask('+000000000000000');
	});
});

$(document).ready(function () {
	$('body').on('click', '.toggle_password', function (e) {
		e.preventDefault();
		var inputField = $(this).siblings('input');
		var icon = $(this).find('i');
		if (inputField.attr('type') === 'password') {
			inputField.attr('type', 'text');
			icon.removeClass('fa-eye-slash').addClass('fa-eye');
		} else {
			inputField.attr('type', 'password');
			icon.removeClass('fa-eye').addClass('fa-eye-slash');
		}
	});
	$('#contactCruzy.modal form input[name="consent[]"]').attr('required', true);
	var currentPath = window.location.pathname;
	if (currentPath === '/reward-success') {
		const duration = 7 * 1000,
			animationEnd = Date.now() + duration,
			defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
		const canvas = document.getElementById("confetti-canvas");
		(async () => {
			canvas.confetti = canvas.confetti || (await confetti.create(canvas, { resize: true }));
			function randomInRange(min, max) {
				return Math.random() * (max - min) + min;
			}
			const interval = setInterval(function () {
				const timeLeft = animationEnd - Date.now();
				if (timeLeft <= 0) {
					return clearInterval(interval);
				}
				const particleCount = 50 * (timeLeft / duration);
				canvas.confetti(
					Object.assign({}, defaults, {
						particleCount,
						origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
					})
				);
				canvas.confetti(
					Object.assign({}, defaults, {
						particleCount,
						origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
					})
				);
			}, 250);
		})();
	}
	if ($('section#pg404_cd').length > 0) {
		const phrases = ["Got lost?", "How.....?", "Why.....?", "Ahhhh...."];
		const $spanElement = $("#txt_chng_span");
		let index = 0;
		let letterIndex = 0;
		let typingSpeed = 100;
		let delayBetweenWords = 2000;
		function typeText() {
			const currentPhrase = phrases[index];
			if (letterIndex < currentPhrase.length) {
				$spanElement.text($spanElement.text() + currentPhrase.charAt(letterIndex));
				letterIndex++;
				setTimeout(typeText, typingSpeed);
			} else {
				setTimeout(() => {
					letterIndex = 0;
					index = (index + 1) % phrases.length;
					$spanElement.text("");
					typeText();
				}, delayBetweenWords);
			}
		}
		typeText();
	}

	function initializeIntlTelInput(selector, dynamic = false) {
		function setupInput(input) {
			var iti = window.intlTelInput(input, {
				initialCountry: "us",
				separateDialCode: true,
				preferredCountries: ["us", "ca"],
				autoPlaceholder: "off",
				utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
			});
			$(input).on("input", function () {
				let raw = $(this).val().replace(/\D/g, '');
				if (raw.length > 15) {
					raw = raw.slice(0, 15);
				}
				$(this).val(raw);
			});
			$(input).on("blur", function () {
				var fullNumber = iti.getNumber();
				$(input).val(fullNumber);
			});
		}
		if (dynamic) {
			$(document).on("focus", selector, function () {
				if (!$(this).data("iti-initialized")) {
					setupInput(this);
					$(this).data("iti-initialized", true);
				}
			});
		} else {
			$(selector).each(function () {
				setupInput(this);
			});
		}
	}
	var staticSelectors = [
		"#form-ship input#phone",
		"#edit-cruzy-plus-form input#user_phone",
		".contact_form form input#phone",
		".request_form form input#phone",
		"#form-make-a-payment input#phone",
		"#addAuthorizedUserForm input#authorized_phone",
		"form#ch_form-ship input#phone",
		"form.update_mycharter input#phone"
	];
	staticSelectors.forEach(selector => initializeIntlTelInput(selector));
	initializeIntlTelInput("section#form_shipcnt input.form-control.authorized_phone", true);

	$('.select2').select2({
		width: '100%',
		placeholder: $(this).data('placeholder'),
		allowClear: true
	});
	if (window.location.pathname === '/my-account') {
		$("#user_phone").focus();
	}
	$('#country').on('change', function () {
		var countryName = $(this).val();
		$('#state').empty().append('<option value="">Select State</option>').prop('disabled', true);
		if (countryName) {
			$.ajax({
				url: '/get-states',
				type: 'POST',
				data: {
					country_name: countryName,
					_token: $('meta[name="csrf-token"]').attr('content')
				},
				dataType: 'json',
				success: function (data) {
					$('#state').prop('disabled', false);
					$.each(data, function (index, state) {
						$('#state').append('<option value="' + state.name + '">' + state.name + '</option>');
					});
					$('#state').trigger('change');
				}
			});
		}
	});
	var savedState = $('#saved_user_state').val();
	$('#user_country').on('change', function () {
		var countryName = $(this).val();
		$('#user_state').empty().append('<option value="">Select State</option>').prop('disabled', true);
		if (countryName) {
			$.ajax({
				url: '/get-states',
				type: 'POST',
				data: {
					country_name: countryName,
					_token: $('meta[name="csrf-token"]').attr('content')
				},
				dataType: 'json',
				success: function (data) {
					$('#user_state').prop('disabled', false);
					$.each(data, function (index, state) {
						$('#user_state').append('<option value="' + state.name + '">' + state.name + '</option>');
					});
					if (savedState) {
						$('#user_state').val(savedState).trigger('change');
					}
				}
			});
		}
	});
	if ($('#user_country').val()) {
		$('#user_country').trigger('change');
	}
});

$(document).ready(function () {
	/*$('.marquee').marquee({
		duration: 15000,
		gap: 0,
		delayBeforeStart: 0,
		direction: 'left',
		duplicated: false
	});*/
	const WATCHED_PATH = "/my-account";
	const RELOAD_INTERVAL_MINUTES = 25;
	const RELOAD_INTERVAL_MS = RELOAD_INTERVAL_MINUTES * 60 * 1000;
	const RELOAD_WARNING_OFFSET = 30;
	const RELOAD_WARNING_OFFSET_MS = RELOAD_WARNING_OFFSET * 1000;
	let timeoutId = null;
	let warningTimeoutId = null;
	let countdownIntervalId = null;
	let currentPath = window.location.pathname;
	function showReloadWarning() {
		let secondsLeft = RELOAD_WARNING_OFFSET;
		Swal.fire({
			title: 'You’ve been inactive for 30 minutes',
			html: 'The page will reload in <b>30</b> seconds.',
			timer: RELOAD_WARNING_OFFSET_MS,
			timerProgressBar: true,
			didOpen: () => {
				const content = Swal.getHtmlContainer().querySelector('b');
				countdownIntervalId = setInterval(() => {
					secondsLeft--;
					content.textContent = secondsLeft;
				}, 1000);
			},
			willClose: () => {
				clearInterval(countdownIntervalId);
			}
		});
	}
	function startReloadTimer() {
		clearTimeout(timeoutId);
		clearTimeout(warningTimeoutId);
		clearInterval(countdownIntervalId);
		if (window.location.pathname === WATCHED_PATH) {
			warningTimeoutId = setTimeout(function () {
				if (window.location.pathname === WATCHED_PATH) {
					showReloadWarning();
				}
			}, RELOAD_INTERVAL_MS - RELOAD_WARNING_OFFSET_MS);
			timeoutId = setTimeout(function () {
				if (window.location.pathname === WATCHED_PATH) {
					location.reload(true);
				}
			}, RELOAD_INTERVAL_MS);
		}
	}
	function onPathChange() {
		let newPath = window.location.pathname;
		if (newPath !== currentPath) {
			currentPath = newPath;
			clearTimeout(timeoutId);
			clearTimeout(warningTimeoutId);
			clearInterval(countdownIntervalId);
			if (newPath === WATCHED_PATH) {
				startReloadTimer();
			}
		}
	}
	const pushState = history.pushState;
	history.pushState = function () {
		pushState.apply(this, arguments);
		onPathChange();
	};
	const replaceState = history.replaceState;
	history.replaceState = function () {
		replaceState.apply(this, arguments);
		onPathChange();
	};
	window.addEventListener('popstate', onPathChange);
	if (window.location.pathname === WATCHED_PATH) {
		startReloadTimer();
	}

	if (window.location.pathname === '/' || window.location.pathname === '/home') {
		if (window.flashMessages && window.flashMessages.error) {
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: window.flashMessages.error
			});
		}
		if (window.flashMessages && window.flashMessages.success) {
			Swal.fire({
				icon: 'success',
				title: 'Success',
				text: window.flashMessages.success
			});
		}
		if (window.flashMessages && window.flashMessages.info) {
			Swal.fire({
				icon: 'info',
				title: 'Info',
				text: window.flashMessages.info
			});
		}
	}
});

$(document).ready(function () {
	$('.festival-carousel').slick({
		infinite: true,
		speed: 1000,
		autoplay: true,
		autoplaySpeed: 3000,
		slidesToShow: 4,
		slidesToScroll: 1,
		arrows: true,
		dots: false,
		rows: 0,
		adaptiveHeight: true,
		responsive: [
			{
				breakpoint: 1200,
				settings: {slidesToShow: 3}
			},
			{
				breakpoint: 992,
				settings: {slidesToShow: 2}
			},
			{
				breakpoint: 768,
				settings: {slidesToShow: 1}
			}
		]
	});
	$('.sail_days_count').countTo();
});

$(document).ready(function () {
	$('#newsletter-form').on('submit', function (e) {
		e.preventDefault();
		const $form = $(this);
		grecaptcha.ready(function () {
			grecaptcha.execute('6LeNhlUrAAAAAECltOnq4fnZ5A-2ZmCiBNtKGarR', { action: 'submit' }).then(function (token) {
				let input = $form.find('input[name="g-recaptcha-response"]');
				if (!input.length) {
					input = $('<input>', {
						type: 'hidden',
						name: 'g-recaptcha-response'
					}).appendTo($form);
				}
				input.val(token);
				$.ajax({
					type: 'POST',
					url: $form.attr('action'),
					data: $form.serialize(),
					success: function (data) {
						if (data.success === true) {
							$form.parent().html('<p class="text-white">Thank you for subscribing!</p>');
						} else if (data.errors && data.errors.email) {
							$('#subscribe-msg').addClass('error').html(data.errors.email[0]);
						} else {
							$('#subscribe-msg').addClass('error').html('Something went wrong');
						}
					},
					error: function () {
						$('#subscribe-msg').addClass('error').html('Server error. Please try again later.');
					}
				});
			});
		});
	});
});
;