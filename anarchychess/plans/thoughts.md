First of all, how are we storing the position?

Bitboards might work but they're hard to do in JS afaik

For now we can use a string with o for knooks.

Because all the en passant variants probably ought to be immediate responses, it's worth storing the last move somehow

We also need something nice and generalisable for move conditions.
We don't want to be writing conditionals for everything.

I'd probably get a better idea of how to do things by writing detailed specifications for each move.
