import { motion, AnimatePresence } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

export function AnimatedTransactionsTable({ transactions, loading }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sender/Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.tr
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TableCell colSpan={2} className="h-24 text-center">
                Loading transactions...
              </TableCell>
            </motion.tr>
          ) : transactions.length === 0 ? (
            <motion.tr
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TableCell colSpan={2} className="h-24 text-center">
                No transactions found
              </TableCell>
            </motion.tr>
          ) : (
            transactions.map((tx, index) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-muted/50"
              >
                <TableCell>
                  <div className="font-medium">{tx.sender}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{tx.amount.toFixed(2)}
                </TableCell>
              </motion.tr>
            ))
          )}
        </AnimatePresence>
      </TableBody>
    </Table>
  );
}