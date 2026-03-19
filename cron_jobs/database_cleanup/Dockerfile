FROM mongo

COPY remove_unplaced_orders.sh /
COPY remove_old_order_references.sh /
COPY remove_old_customer_item_references.sh /
COPY remove_inactive_users.sh /

CMD ["sh", "-c", "/remove_unplaced_orders.sh && /remove_old_order_references.sh && /remove_old_customer_item_references.sh && /remove_inactive_users.sh"]
