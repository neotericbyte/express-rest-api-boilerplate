<?php 
    header('Access-Control-Allow-Origin: *');
    $snapToken  = $_GET['snapToken'];
    $userId     = $_GET['userId'];
    $email      = $_GET['email'];
    $partnerCode= $_GET['partnerCode'];
    $apiKey     = $_GET['apiKey'];
    $unique_code= $_GET['unique_code'];
?>
<html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
        <script type="text/javascript"
                src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key="SB-Mid-client-HVRV033DJsn7agYU"></script> 
    </head>
    <body>
        <button id="pay-button">Pay!</button>
        <script type="text/javascript">
            document.getElementById('pay-button').onclick = function(){
                // SnapToken acquired from previous step
                var formData = {};
                snap.pay('<?php echo $snapToken;?>', {
                    // Optional
                    onSuccess: function(result){
                        //console.log('result',result);
                        formData = {
                            'apiKey'        : '<?php echo $apiKey;?>',
                            'partnerCode'       : '<?php echo $partnerCode;?>',
                            'userId'        : '<?php echo $userId;?>',
                            'email'         : '<?php echo $email;?>',
                            'unique_code'   : '<?php echo $unique_code;?>',
                            'status_code'   : result.status_code,
                            'approval_code' : result.approval_code,
                            'bank'          : result.bank,
                            'fraud_status'  : result.fraud_status,
                            'gross_amount'  : result.gross_amount,
                            'order_id'      : result.order_id,
                            'payment_type'  : result.payment_type,
                            'status_message' :result.status_message,
                            'transaction_id' :result.transaction_id,
                            'transaction_status': result.transaction_status,
                            'transaction_time': result.transaction_time
                        };

                        //console.log('formData',formData); eventPaymentDetails
                        $.ajax({
                            url: 'http://150.129.179.172:7777/api/partner/admin/userPaymentDetails',
                            beforeSend: function(request) {
                                request.setRequestHeader("apiKey", ""+formData.apiKey+"");
                                request.setRequestHeader("partnercode", ""+formData.partnerCode+"" );
                            },
                            type: 'POST',
                            //dataType: 'json',
                            data: 'userId='+formData.userId+'&email='+formData.email+'&status_code='+formData.status_code+'&approval_code='+formData.approval_code+'&bank='+formData.bank+'&fraud_status='+formData.fraud_status+'&gross_amount='+formData.gross_amount+'&order_id='+formData.order_id+'&payment_type='+formData.payment_type+'&status_message='+formData.status_message+'&transaction_id='+formData.transaction_id+'&transaction_status='+formData.transaction_status+'&transaction_time='+formData.transaction_time, //forms user object,
                            success: function(data){
                                //console.log('succes: '+data);
                                if(data == 'OK'){
                                    //console.log('formData.eventid',formData.eventid);
                                    $.ajax({
                                        url: 'http://150.129.179.172:7777/api/partner/admin/updateUserType',
                                        beforeSend: function(request) {
                                            request.setRequestHeader("apiKey", ""+formData.apiKey+"");
                                            request.setRequestHeader("partnercode", ""+formData.partnerCode+"" );
                                        },
                                        type: 'POST',
                                        data: 'userId='+formData.userId+'&unique_code='+formData.unique_code,
                                        success: function(res){
                                            if(res == 'OK'){
                                                window.location.href= "http://202.67.14.92:8080/midtransApi/success.php?type=success";
                                            } else {
                                                window.location.href= "http://202.67.14.92:8080/midtransApi/success.php?type=error";
                                            }
                                        } 
                                    });
                                } else {
                                    window.location.href= "http://202.67.14.92:8080/midtransApi/success.php?type=error";
                                }
                            }
                        });
                    },
                    // Optional
                    onPending: function(result){
                         console.log('onPending',result);
                         formData = {};
                        /* You may add your own js here, this is just example */ 
                        //document.getElementById('result-json').innerHTML += JSON.stringify(result, null, 2);
                        window.location.href= "http://202.67.14.92:8080/midtransApi/success.php?type=error";
                    },
                    // Optional
                    onError: function(result){
                        console.log('onError',result);
                        formData = {};
                        /* You may add your own js here, this is just example */ 
                        //document.getElementById('result-json').innerHTML += JSON.stringify(result, null, 2);
                        window.location.href= "http://202.67.14.92:8080/midtransApi/success.php?type=error";
                    }
                });
            };
        </script>
    </body>
</html>
<?php ?>