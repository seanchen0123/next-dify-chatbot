'use client'

import { useState } from 'react'
import { FileTextIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RetrieverResource } from '@/types/message'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface CitationReferencesProps {
  resources: RetrieverResource[]
}

interface GroupedResource {
  document_id: string
  document_name: string
  segments: RetrieverResource[]
}

export function CitationReferences({ resources }: CitationReferencesProps) {
  const [open, setOpen] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)

  if (resources.length === 0) {
    return null
  }

  // 按文档ID分组
  const groupedResources = resources.reduce((acc, resource) => {
    const existingGroup = acc.find(group => group.document_id === resource.document_id)

    if (existingGroup) {
      existingGroup.segments.push(resource)
    } else {
      acc.push({
        document_id: resource.document_id,
        document_name: resource.document_name,
        segments: [resource]
      })
    }

    return acc
  }, [] as GroupedResource[])

  const handleOpenDocument = (documentId: string) => {
    setSelectedDocumentId(documentId)
    setOpen(true)
  }

  const selectedDocument = groupedResources.find(doc => doc.document_id === selectedDocumentId)

  return (
    <div className="mt-2 pt-2 border-t border-border">
      <div className="text-xs text-muted-foreground mb-2">引用内容</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {groupedResources.map(doc => (
          <Button
            key={doc.document_id}
            variant="outline"
            size="sm"
            className="text-xs flex items-center gap-1 truncate"
            onClick={() => handleOpenDocument(doc.document_id)}
          >
            <FileTextIcon className="h-3 w-3 flex-shrink-0" />
            <span className="truncate" title={doc.document_name}>
              {doc.document_name}
            </span>
          </Button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl px-2 py-4 sm:px-4 w-[96%] rounded-lg">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-left">
                  <FileTextIcon className="h-4 w-4" />
                  <span className="text-sm truncate w-[88%]">{selectedDocument.document_name}</span>
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                {selectedDocument.segments.map((segment, index) => (
                  <div key={index} className="mb-4">
                    <div className="py-2 px-4 bg-muted/50 rounded-md whitespace-pre-wrap text-sm">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" className='px-2 my-2 h-7 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary border-primary/20 flex items-center justify-center'>{`# ${segment.segment_position}`}</Button>
                          </TooltipTrigger>
                          <TooltipContent side='right'>
                            <p>分段编号</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <p className='text-sm'>
                      {segment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
