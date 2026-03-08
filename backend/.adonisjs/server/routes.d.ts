import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.legacyToken': { paramsTuple?: []; params?: {} }
    'v2.auth.token': { paramsTuple?: []; params?: {} }
    'auth.vipps.redirect': { paramsTuple?: []; params?: {} }
    'auth.vipps.callback': { paramsTuple?: []; params?: {} }
    'auth.local.login': { paramsTuple?: []; params?: {} }
    'auth.local.register': { paramsTuple?: []; params?: {} }
    'auth.password.forgot': { paramsTuple?: []; params?: {} }
    'auth.password.reset.validate': { paramsTuple?: []; params?: {} }
    'auth.password.reset': { paramsTuple?: []; params?: {} }
    'waiting_list_entries.getAll': { paramsTuple?: []; params?: {} }
    'waiting_list_entries.add': { paramsTuple?: []; params?: {} }
    'waiting_list_entries.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reminders.count_recipients': { paramsTuple?: []; params?: {} }
    'reminders.send': { paramsTuple?: []; params?: {} }
    'branches.add': { paramsTuple?: []; params?: {} }
    'branches.update': { paramsTuple?: []; params?: {} }
    'branches.addMemberships': { paramsTuple?: []; params?: {} }
    'branches.addSubjectChoices': { paramsTuple?: []; params?: {} }
    'branches.relationships.update': { paramsTuple?: []; params?: {} }
    'branches.memberships.get': { paramsTuple: [ParamValue]; params: {'branchId': ParamValue} }
    'branches.memberships.update': { paramsTuple?: []; params?: {} }
    'branches.memberships.remove.direct': { paramsTuple: [ParamValue]; params: {'branchId': ParamValue} }
    'branches.memberships.remove.indirect': { paramsTuple: [ParamValue]; params: {'branchId': ParamValue} }
    'open_orders.get': { paramsTuple?: []; params?: {} }
    'open_orders.cancel': { paramsTuple?: []; params?: {} }
    'editable_texts.getAll': { paramsTuple?: []; params?: {} }
    'editable_texts.getByKey': { paramsTuple: [ParamValue]; params: {'key': ParamValue} }
    'editable_texts.store': { paramsTuple?: []; params?: {} }
    'editable_texts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'editable_texts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'questions_and_answers.getAll': { paramsTuple?: []; params?: {} }
    'questions_and_answers.store': { paramsTuple?: []; params?: {} }
    'questions_and_answers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'questions_and_answers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'email_validations.create': { paramsTuple?: []; params?: {} }
    'email_validations.confirm': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blid.lookup': { paramsTuple: [ParamValue]; params: {'blid': ParamValue} }
    'matches.generate': { paramsTuple?: []; params?: {} }
    'matches.notify': { paramsTuple?: []; params?: {} }
    'matches.lock': { paramsTuple?: []; params?: {} }
    'matches.getMyMatches': { paramsTuple?: []; params?: {} }
    'matches.transfer_item': { paramsTuple?: []; params?: {} }
    'user_detail.getById': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'user_detail.getMyDetails': { paramsTuple?: []; params?: {} }
    'user_detail.updateAsCustomer': { paramsTuple?: []; params?: {} }
    'user_detail.updateAsEmployee': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'customer_items.get': { paramsTuple?: []; params?: {} }
    'signatures.send.link': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'signatures.me.send': { paramsTuple?: []; params?: {} }
    'signatures.valid': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'signatures.get': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'signatures.sign': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'unique_ids.token': { paramsTuple?: []; params?: {} }
    'unique_ids.download.pdf': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'users.create': { paramsTuple?: []; params?: {} }
    'unique_items.add': { paramsTuple?: []; params?: {} }
    'order_history.get.my.order': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'order_history.get.my.orders': { paramsTuple?: []; params?: {} }
    'checkout.initialize': { paramsTuple?: []; params?: {} }
    'checkout.confirm': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'checkout.vipps.callback': { paramsTuple?: []; params?: {} }
    'checkout.poll': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'subjects.get.branch.subjects': { paramsTuple: [ParamValue]; params: {'branchId': ParamValue} }
    'branch_items.get': { paramsTuple: [ParamValue]; params: {'branchId': ParamValue} }
    'branch_items.post': { paramsTuple?: []; params?: {} }
    'lookup.postal.code': { paramsTuple: [ParamValue]; params: {'postalCode': ParamValue} }
    'companies.get': { paramsTuple?: []; params?: {} }
    'companies.add': { paramsTuple?: []; params?: {} }
    'companies.delete': { paramsTuple: [ParamValue]; params: {'companyId': ParamValue} }
    'opening_hours.get': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'opening_hours.add': { paramsTuple?: []; params?: {} }
    'opening_hours.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'items.get': { paramsTuple?: []; params?: {} }
    'dispatch.get.email_templates': { paramsTuple?: []; params?: {} }
    'dispatch.create': { paramsTuple?: []; params?: {} }
    'collection.branches.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.branches.getAll': { paramsTuple?: []; params?: {} }
    'collection.branches.post': { paramsTuple?: []; params?: {} }
    'collection.branches.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.branchitems.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.branchitems.post': { paramsTuple?: []; params?: {} }
    'collection.branchitems.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.branchitems.getAll': { paramsTuple?: []; params?: {} }
    'collection.branchitems.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.customeritems.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.customeritems.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.customeritems.post': { paramsTuple?: []; params?: {} }
    'collection.customeritems.operation.generate-report.post': { paramsTuple?: []; params?: {} }
    'collection.customeritems.getAll': { paramsTuple?: []; params?: {} }
    'collection.deliveries.post': { paramsTuple?: []; params?: {} }
    'collection.deliveries.getAll': { paramsTuple?: []; params?: {} }
    'collection.deliveries.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.deliveries.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.deliveries.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.items.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.items.getAll': { paramsTuple?: []; params?: {} }
    'collection.items.post': { paramsTuple?: []; params?: {} }
    'collection.items.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.openinghours.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.openinghours.getAll': { paramsTuple?: []; params?: {} }
    'collection.openinghours.post': { paramsTuple?: []; params?: {} }
    'collection.openinghours.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.post': { paramsTuple?: []; params?: {} }
    'collection.orders.operation.rapid-handout.post': { paramsTuple?: []; params?: {} }
    'collection.orders.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.operation.place.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.operation.confirm.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.operation.get_customer_orders.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.getAll': { paramsTuple?: []; params?: {} }
    'collection.payments.post': { paramsTuple?: []; params?: {} }
    'collection.payments.getAll': { paramsTuple?: []; params?: {} }
    'collection.payments.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.payments.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.payments.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.operation.valid.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.operation.permission.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.getAll': { paramsTuple?: []; params?: {} }
    'collection.messages.post': { paramsTuple?: []; params?: {} }
    'collection.messages.operation.sendgrid-events.post': { paramsTuple?: []; params?: {} }
    'collection.messages.operation.twilio-sms-events.post': { paramsTuple?: []; params?: {} }
    'collection.messages.getAll': { paramsTuple?: []; params?: {} }
    'collection.messages.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.messages.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.invoices.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.invoices.getAll': { paramsTuple?: []; params?: {} }
    'collection.invoices.post': { paramsTuple?: []; params?: {} }
    'collection.invoices.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.companies.getAll': { paramsTuple?: []; params?: {} }
    'collection.companies.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.companies.post': { paramsTuple?: []; params?: {} }
    'collection.companies.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.companies.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.uniqueitems.post': { paramsTuple?: []; params?: {} }
    'collection.uniqueitems.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.uniqueitems.operation.active.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.uniqueitems.getAll': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'auth.vipps.redirect': { paramsTuple?: []; params?: {} }
    'auth.vipps.callback': { paramsTuple?: []; params?: {} }
    'waiting_list_entries.getAll': { paramsTuple?: []; params?: {} }
    'branches.memberships.get': { paramsTuple: [ParamValue]; params: {'branchId': ParamValue} }
    'open_orders.get': { paramsTuple?: []; params?: {} }
    'editable_texts.getAll': { paramsTuple?: []; params?: {} }
    'editable_texts.getByKey': { paramsTuple: [ParamValue]; params: {'key': ParamValue} }
    'questions_and_answers.getAll': { paramsTuple?: []; params?: {} }
    'email_validations.confirm': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blid.lookup': { paramsTuple: [ParamValue]; params: {'blid': ParamValue} }
    'matches.getMyMatches': { paramsTuple?: []; params?: {} }
    'user_detail.getById': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'user_detail.getMyDetails': { paramsTuple?: []; params?: {} }
    'customer_items.get': { paramsTuple?: []; params?: {} }
    'signatures.valid': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'signatures.get': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'unique_ids.token': { paramsTuple?: []; params?: {} }
    'unique_ids.download.pdf': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'order_history.get.my.order': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'order_history.get.my.orders': { paramsTuple?: []; params?: {} }
    'checkout.poll': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'subjects.get.branch.subjects': { paramsTuple: [ParamValue]; params: {'branchId': ParamValue} }
    'branch_items.get': { paramsTuple: [ParamValue]; params: {'branchId': ParamValue} }
    'lookup.postal.code': { paramsTuple: [ParamValue]; params: {'postalCode': ParamValue} }
    'companies.get': { paramsTuple?: []; params?: {} }
    'opening_hours.get': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'items.get': { paramsTuple?: []; params?: {} }
    'dispatch.get.email_templates': { paramsTuple?: []; params?: {} }
    'collection.branches.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.branches.getAll': { paramsTuple?: []; params?: {} }
    'collection.branchitems.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.branchitems.getAll': { paramsTuple?: []; params?: {} }
    'collection.customeritems.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.customeritems.getAll': { paramsTuple?: []; params?: {} }
    'collection.deliveries.getAll': { paramsTuple?: []; params?: {} }
    'collection.deliveries.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.items.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.items.getAll': { paramsTuple?: []; params?: {} }
    'collection.openinghours.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.openinghours.getAll': { paramsTuple?: []; params?: {} }
    'collection.orders.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.operation.get_customer_orders.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.getAll': { paramsTuple?: []; params?: {} }
    'collection.payments.getAll': { paramsTuple?: []; params?: {} }
    'collection.payments.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.operation.valid.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.operation.permission.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.getAll': { paramsTuple?: []; params?: {} }
    'collection.messages.getAll': { paramsTuple?: []; params?: {} }
    'collection.messages.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.invoices.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.invoices.getAll': { paramsTuple?: []; params?: {} }
    'collection.companies.getAll': { paramsTuple?: []; params?: {} }
    'collection.companies.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.uniqueitems.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.uniqueitems.operation.active.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.uniqueitems.getAll': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'auth.vipps.redirect': { paramsTuple?: []; params?: {} }
    'auth.vipps.callback': { paramsTuple?: []; params?: {} }
    'waiting_list_entries.getAll': { paramsTuple?: []; params?: {} }
    'branches.memberships.get': { paramsTuple: [ParamValue]; params: {'branchId': ParamValue} }
    'open_orders.get': { paramsTuple?: []; params?: {} }
    'editable_texts.getAll': { paramsTuple?: []; params?: {} }
    'editable_texts.getByKey': { paramsTuple: [ParamValue]; params: {'key': ParamValue} }
    'questions_and_answers.getAll': { paramsTuple?: []; params?: {} }
    'email_validations.confirm': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blid.lookup': { paramsTuple: [ParamValue]; params: {'blid': ParamValue} }
    'matches.getMyMatches': { paramsTuple?: []; params?: {} }
    'user_detail.getById': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'user_detail.getMyDetails': { paramsTuple?: []; params?: {} }
    'customer_items.get': { paramsTuple?: []; params?: {} }
    'signatures.valid': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'signatures.get': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'unique_ids.token': { paramsTuple?: []; params?: {} }
    'unique_ids.download.pdf': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'order_history.get.my.order': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'order_history.get.my.orders': { paramsTuple?: []; params?: {} }
    'checkout.poll': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'subjects.get.branch.subjects': { paramsTuple: [ParamValue]; params: {'branchId': ParamValue} }
    'branch_items.get': { paramsTuple: [ParamValue]; params: {'branchId': ParamValue} }
    'lookup.postal.code': { paramsTuple: [ParamValue]; params: {'postalCode': ParamValue} }
    'companies.get': { paramsTuple?: []; params?: {} }
    'opening_hours.get': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'items.get': { paramsTuple?: []; params?: {} }
    'dispatch.get.email_templates': { paramsTuple?: []; params?: {} }
    'collection.branches.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.branches.getAll': { paramsTuple?: []; params?: {} }
    'collection.branchitems.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.branchitems.getAll': { paramsTuple?: []; params?: {} }
    'collection.customeritems.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.customeritems.getAll': { paramsTuple?: []; params?: {} }
    'collection.deliveries.getAll': { paramsTuple?: []; params?: {} }
    'collection.deliveries.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.items.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.items.getAll': { paramsTuple?: []; params?: {} }
    'collection.openinghours.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.openinghours.getAll': { paramsTuple?: []; params?: {} }
    'collection.orders.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.operation.get_customer_orders.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.getAll': { paramsTuple?: []; params?: {} }
    'collection.payments.getAll': { paramsTuple?: []; params?: {} }
    'collection.payments.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.operation.valid.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.operation.permission.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.getAll': { paramsTuple?: []; params?: {} }
    'collection.messages.getAll': { paramsTuple?: []; params?: {} }
    'collection.messages.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.invoices.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.invoices.getAll': { paramsTuple?: []; params?: {} }
    'collection.companies.getAll': { paramsTuple?: []; params?: {} }
    'collection.companies.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.uniqueitems.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.uniqueitems.operation.active.getId': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.uniqueitems.getAll': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.legacyToken': { paramsTuple?: []; params?: {} }
    'v2.auth.token': { paramsTuple?: []; params?: {} }
    'auth.local.login': { paramsTuple?: []; params?: {} }
    'auth.local.register': { paramsTuple?: []; params?: {} }
    'auth.password.forgot': { paramsTuple?: []; params?: {} }
    'auth.password.reset.validate': { paramsTuple?: []; params?: {} }
    'auth.password.reset': { paramsTuple?: []; params?: {} }
    'waiting_list_entries.add': { paramsTuple?: []; params?: {} }
    'reminders.count_recipients': { paramsTuple?: []; params?: {} }
    'reminders.send': { paramsTuple?: []; params?: {} }
    'branches.add': { paramsTuple?: []; params?: {} }
    'branches.addMemberships': { paramsTuple?: []; params?: {} }
    'branches.addSubjectChoices': { paramsTuple?: []; params?: {} }
    'open_orders.cancel': { paramsTuple?: []; params?: {} }
    'editable_texts.store': { paramsTuple?: []; params?: {} }
    'questions_and_answers.store': { paramsTuple?: []; params?: {} }
    'email_validations.create': { paramsTuple?: []; params?: {} }
    'matches.generate': { paramsTuple?: []; params?: {} }
    'matches.notify': { paramsTuple?: []; params?: {} }
    'matches.lock': { paramsTuple?: []; params?: {} }
    'matches.transfer_item': { paramsTuple?: []; params?: {} }
    'user_detail.updateAsCustomer': { paramsTuple?: []; params?: {} }
    'user_detail.updateAsEmployee': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'signatures.send.link': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'signatures.me.send': { paramsTuple?: []; params?: {} }
    'signatures.sign': { paramsTuple: [ParamValue]; params: {'detailsId': ParamValue} }
    'users.create': { paramsTuple?: []; params?: {} }
    'unique_items.add': { paramsTuple?: []; params?: {} }
    'checkout.initialize': { paramsTuple?: []; params?: {} }
    'checkout.confirm': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'checkout.vipps.callback': { paramsTuple?: []; params?: {} }
    'branch_items.post': { paramsTuple?: []; params?: {} }
    'companies.add': { paramsTuple?: []; params?: {} }
    'opening_hours.add': { paramsTuple?: []; params?: {} }
    'dispatch.create': { paramsTuple?: []; params?: {} }
    'collection.branches.post': { paramsTuple?: []; params?: {} }
    'collection.branchitems.post': { paramsTuple?: []; params?: {} }
    'collection.customeritems.post': { paramsTuple?: []; params?: {} }
    'collection.customeritems.operation.generate-report.post': { paramsTuple?: []; params?: {} }
    'collection.deliveries.post': { paramsTuple?: []; params?: {} }
    'collection.items.post': { paramsTuple?: []; params?: {} }
    'collection.openinghours.post': { paramsTuple?: []; params?: {} }
    'collection.orders.post': { paramsTuple?: []; params?: {} }
    'collection.orders.operation.rapid-handout.post': { paramsTuple?: []; params?: {} }
    'collection.payments.post': { paramsTuple?: []; params?: {} }
    'collection.messages.post': { paramsTuple?: []; params?: {} }
    'collection.messages.operation.sendgrid-events.post': { paramsTuple?: []; params?: {} }
    'collection.messages.operation.twilio-sms-events.post': { paramsTuple?: []; params?: {} }
    'collection.invoices.post': { paramsTuple?: []; params?: {} }
    'collection.companies.post': { paramsTuple?: []; params?: {} }
    'collection.uniqueitems.post': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'waiting_list_entries.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'branches.memberships.remove.direct': { paramsTuple: [ParamValue]; params: {'branchId': ParamValue} }
    'branches.memberships.remove.indirect': { paramsTuple: [ParamValue]; params: {'branchId': ParamValue} }
    'editable_texts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'questions_and_answers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'companies.delete': { paramsTuple: [ParamValue]; params: {'companyId': ParamValue} }
    'opening_hours.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.branchitems.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.deliveries.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.payments.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.messages.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.companies.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'branches.update': { paramsTuple?: []; params?: {} }
    'branches.relationships.update': { paramsTuple?: []; params?: {} }
    'branches.memberships.update': { paramsTuple?: []; params?: {} }
    'editable_texts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'questions_and_answers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.branches.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.branchitems.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.customeritems.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.deliveries.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.items.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.openinghours.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.operation.place.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.orders.operation.confirm.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.payments.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.userdetails.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.invoices.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.companies.patch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}