/**
 *
 */

module.exports = {
  "transaction.succeeded": function (pusher, response, payload) {
    pusher.trigger("paymill_graphs", "transaction_received", {
      amount: payload.amount,
      currency: payload.currency,
      date: payload.created_at,
      card_type: payload.payment.card_type
    });
  }
};
