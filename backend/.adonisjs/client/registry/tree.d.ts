/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    legacyToken: typeof routes['auth.legacyToken']
    vipps: {
      redirect: typeof routes['auth.vipps.redirect']
      callback: typeof routes['auth.vipps.callback']
    }
    local: {
      login: typeof routes['auth.local.login']
      register: typeof routes['auth.local.register']
    }
    password: {
      forgot: typeof routes['auth.password.forgot']
      reset: typeof routes['auth.password.reset'] & {
        validate: typeof routes['auth.password.reset.validate']
      }
    }
  }
  v2: {
    auth: {
      token: typeof routes['v2.auth.token']
    }
  }
  waitingListEntries: {
    getAll: typeof routes['waiting_list_entries.getAll']
    add: typeof routes['waiting_list_entries.add']
    delete: typeof routes['waiting_list_entries.delete']
  }
  reminders: {
    countRecipients: typeof routes['reminders.count_recipients']
    send: typeof routes['reminders.send']
  }
  branches: {
    add: typeof routes['branches.add']
    update: typeof routes['branches.update']
    addMemberships: typeof routes['branches.addMemberships']
    addSubjectChoices: typeof routes['branches.addSubjectChoices']
    relationships: {
      update: typeof routes['branches.relationships.update']
    }
    memberships: {
      get: typeof routes['branches.memberships.get']
      update: typeof routes['branches.memberships.update']
      remove: {
        direct: typeof routes['branches.memberships.remove.direct']
        indirect: typeof routes['branches.memberships.remove.indirect']
      }
    }
  }
  openOrders: {
    get: typeof routes['open_orders.get']
    cancel: typeof routes['open_orders.cancel']
  }
  editableTexts: {
    getAll: typeof routes['editable_texts.getAll']
    getByKey: typeof routes['editable_texts.getByKey']
    store: typeof routes['editable_texts.store']
    update: typeof routes['editable_texts.update']
    destroy: typeof routes['editable_texts.destroy']
  }
  questionsAndAnswers: {
    getAll: typeof routes['questions_and_answers.getAll']
    store: typeof routes['questions_and_answers.store']
    update: typeof routes['questions_and_answers.update']
    destroy: typeof routes['questions_and_answers.destroy']
  }
  emailValidations: {
    create: typeof routes['email_validations.create']
    confirm: typeof routes['email_validations.confirm']
  }
  blid: {
    lookup: typeof routes['blid.lookup']
  }
  matches: {
    generate: typeof routes['matches.generate']
    notify: typeof routes['matches.notify']
    lock: typeof routes['matches.lock']
    getMyMatches: typeof routes['matches.getMyMatches']
    transferItem: typeof routes['matches.transfer_item']
  }
  userDetail: {
    getById: typeof routes['user_detail.getById']
    getMyDetails: typeof routes['user_detail.getMyDetails']
    updateAsCustomer: typeof routes['user_detail.updateAsCustomer']
    updateAsEmployee: typeof routes['user_detail.updateAsEmployee']
  }
  customerItems: {
    get: typeof routes['customer_items.get']
  }
  signatures: {
    send: {
      link: typeof routes['signatures.send.link']
    }
    me: {
      send: typeof routes['signatures.me.send']
    }
    valid: typeof routes['signatures.valid']
    get: typeof routes['signatures.get']
    sign: typeof routes['signatures.sign']
  }
  uniqueIds: {
    token: typeof routes['unique_ids.token']
    download: {
      pdf: typeof routes['unique_ids.download.pdf']
    }
  }
  users: {
    create: typeof routes['users.create']
  }
  uniqueItems: {
    add: typeof routes['unique_items.add']
  }
  orderHistory: {
    get: {
      my: {
        order: typeof routes['order_history.get.my.order']
        orders: typeof routes['order_history.get.my.orders']
      }
    }
  }
  checkout: {
    initialize: typeof routes['checkout.initialize']
    confirm: typeof routes['checkout.confirm']
    vipps: {
      callback: typeof routes['checkout.vipps.callback']
    }
    poll: typeof routes['checkout.poll']
  }
  subjects: {
    get: {
      branch: {
        subjects: typeof routes['subjects.get.branch.subjects']
      }
    }
  }
  branchItems: {
    get: typeof routes['branch_items.get']
    post: typeof routes['branch_items.post']
  }
  lookup: {
    postal: {
      code: typeof routes['lookup.postal.code']
    }
  }
  companies: {
    get: typeof routes['companies.get']
    add: typeof routes['companies.add']
    delete: typeof routes['companies.delete']
  }
  openingHours: {
    get: typeof routes['opening_hours.get']
    add: typeof routes['opening_hours.add']
    delete: typeof routes['opening_hours.delete']
  }
  items: {
    get: typeof routes['items.get']
  }
  dispatch: {
    get: {
      emailTemplates: typeof routes['dispatch.get.email_templates']
    }
    create: typeof routes['dispatch.create']
  }
  collection: {
    branches: {
      getId: typeof routes['collection.branches.getId']
      getAll: typeof routes['collection.branches.getAll']
      post: typeof routes['collection.branches.post']
      patch: typeof routes['collection.branches.patch']
    }
    branchitems: {
      getId: typeof routes['collection.branchitems.getId']
      post: typeof routes['collection.branchitems.post']
      patch: typeof routes['collection.branchitems.patch']
      getAll: typeof routes['collection.branchitems.getAll']
      delete: typeof routes['collection.branchitems.delete']
    }
    customeritems: {
      getId: typeof routes['collection.customeritems.getId']
      patch: typeof routes['collection.customeritems.patch']
      post: typeof routes['collection.customeritems.post']
      operation: {
        generateReport: {
          post: typeof routes['collection.customeritems.operation.generate-report.post']
        }
      }
      getAll: typeof routes['collection.customeritems.getAll']
    }
    deliveries: {
      post: typeof routes['collection.deliveries.post']
      getAll: typeof routes['collection.deliveries.getAll']
      getId: typeof routes['collection.deliveries.getId']
      patch: typeof routes['collection.deliveries.patch']
      delete: typeof routes['collection.deliveries.delete']
    }
    items: {
      getId: typeof routes['collection.items.getId']
      getAll: typeof routes['collection.items.getAll']
      post: typeof routes['collection.items.post']
      patch: typeof routes['collection.items.patch']
    }
    openinghours: {
      getId: typeof routes['collection.openinghours.getId']
      getAll: typeof routes['collection.openinghours.getAll']
      post: typeof routes['collection.openinghours.post']
      patch: typeof routes['collection.openinghours.patch']
    }
    orders: {
      post: typeof routes['collection.orders.post']
      operation: {
        rapidHandout: {
          post: typeof routes['collection.orders.operation.rapid-handout.post']
        }
        place: {
          patch: typeof routes['collection.orders.operation.place.patch']
        }
        confirm: {
          patch: typeof routes['collection.orders.operation.confirm.patch']
        }
        getCustomerOrders: {
          getId: typeof routes['collection.orders.operation.get_customer_orders.getId']
        }
      }
      delete: typeof routes['collection.orders.delete']
      patch: typeof routes['collection.orders.patch']
      getId: typeof routes['collection.orders.getId']
      getAll: typeof routes['collection.orders.getAll']
    }
    payments: {
      post: typeof routes['collection.payments.post']
      getAll: typeof routes['collection.payments.getAll']
      getId: typeof routes['collection.payments.getId']
      patch: typeof routes['collection.payments.patch']
      delete: typeof routes['collection.payments.delete']
    }
    userdetails: {
      getId: typeof routes['collection.userdetails.getId']
      operation: {
        valid: {
          getId: typeof routes['collection.userdetails.operation.valid.getId']
        }
        permission: {
          getId: typeof routes['collection.userdetails.operation.permission.getId']
        }
      }
      patch: typeof routes['collection.userdetails.patch']
      delete: typeof routes['collection.userdetails.delete']
      getAll: typeof routes['collection.userdetails.getAll']
    }
    messages: {
      post: typeof routes['collection.messages.post']
      operation: {
        sendgridEvents: {
          post: typeof routes['collection.messages.operation.sendgrid-events.post']
        }
        twilioSmsEvents: {
          post: typeof routes['collection.messages.operation.twilio-sms-events.post']
        }
      }
      getAll: typeof routes['collection.messages.getAll']
      getId: typeof routes['collection.messages.getId']
      delete: typeof routes['collection.messages.delete']
    }
    invoices: {
      getId: typeof routes['collection.invoices.getId']
      getAll: typeof routes['collection.invoices.getAll']
      post: typeof routes['collection.invoices.post']
      patch: typeof routes['collection.invoices.patch']
    }
    companies: {
      getAll: typeof routes['collection.companies.getAll']
      getId: typeof routes['collection.companies.getId']
      post: typeof routes['collection.companies.post']
      patch: typeof routes['collection.companies.patch']
      delete: typeof routes['collection.companies.delete']
    }
    uniqueitems: {
      post: typeof routes['collection.uniqueitems.post']
      getId: typeof routes['collection.uniqueitems.getId']
      operation: {
        active: {
          getId: typeof routes['collection.uniqueitems.operation.active.getId']
        }
      }
      getAll: typeof routes['collection.uniqueitems.getAll']
    }
  }
}
