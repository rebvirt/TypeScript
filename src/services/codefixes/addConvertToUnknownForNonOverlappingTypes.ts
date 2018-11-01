/* @internal */
namespace ts.codefix {
    const fixId = "addConvertToUnknownForNonOverlappingTypes";
    const errorCodes = [Diagnostics.Conversion_of_type_0_to_type_1_may_be_a_mistake_because_neither_type_sufficiently_overlaps_with_the_other_If_this_was_intentional_convert_the_expression_to_unknown_first.code];
    registerCodeFix({
        errorCodes,
        getCodeActions: (context) => {
            const changes = textChanges.ChangeTracker.with(context, t => makeChange(t, context.sourceFile, context.span.start));
            return [createCodeFixAction(fixId, changes, Diagnostics.Add_unknown_conversion_for_non_overlapping_types, fixId, Diagnostics.Add_unknown_to_all_conversions_of_non_overlapping_types)];
        },
        fixIds: [fixId],
        getAllCodeActions: context => codeFixAll(context, errorCodes, (changes, diag) => makeChange(changes, diag.file, diag.start)),
    });

    function makeChange(changeTracker: textChanges.ChangeTracker, sourceFile: SourceFile, pos: number) {
        const token = getTokenAtPosition(sourceFile, pos);

        const asExpression = findAncestor<AsExpression>(token, isAsExpression)!;
        if (!!asExpression) {
            const nodeBeingConverted = asExpression.getChildAt(0);
            const expressionBeingConverted = findAncestor<Expression>(nodeBeingConverted, isExpression)!;
            Debug.assert(!!expressionBeingConverted, "Expected position to be owned by an expression.");

            const replacement = createAsExpression(expressionBeingConverted, createKeywordTypeNode(SyntaxKind.UnknownKeyword));
            changeTracker.replaceNode(sourceFile, expressionBeingConverted, replacement);
        }

        const typeAssertion = findAncestor<TypeAssertion>(token, isTypeAssertion)!;
        if (!!typeAssertion) {
            const nodeBeingConverted = typeAssertion.getLastToken();
            const expressionBeingConverted = findAncestor<Expression>(nodeBeingConverted, isExpression)!;
            Debug.assert(!!expressionBeingConverted, "Expected position to be owned by an expression.");

            const replacement = createTypeAssertion(createKeywordTypeNode(SyntaxKind.UnknownKeyword), expressionBeingConverted);
            changeTracker.replaceNode(sourceFile, expressionBeingConverted, replacement);
        }
    }
}
